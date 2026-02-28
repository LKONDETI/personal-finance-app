using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using BankingAPI.Data;
using BankingAPI.Configuration;

var builder = WebApplication.CreateBuilder(args);

// ===== Configuration =====
// Load JWT settings from appsettings.json
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// ===== Database Configuration =====
// Configure PostgreSQL with Entity Framework Core
builder.Services.AddDbContext<BankingDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);
    
    // Enable sensitive data logging in development (for learning/debugging)
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// ===== Authentication & Authorization =====
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings == null)
{
    throw new InvalidOperationException("JWT settings are not configured");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero  // No tolerance for token expiration
    };
});

builder.Services.AddAuthorization();

// ===== CORS Configuration =====
// Allow React Native app to access the API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow any origin for easy testing
            policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
        else
        {
            // In production, restrict to specific origins
            policy.WithOrigins(
                    "http://localhost:8081",
                    "exp://localhost:8081"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    });
});

// ===== API Services =====
// Register controllers
builder.Services.AddControllers();

// Register application services
builder.Services.AddScoped<BankingAPI.Services.IAuthService, BankingAPI.Services.AuthService>();
builder.Services.AddScoped<BankingAPI.Services.IAccountService, BankingAPI.Services.AccountService>();
builder.Services.AddScoped<BankingAPI.Services.ITransactionService, BankingAPI.Services.TransactionService>();
builder.Services.AddScoped<BankingAPI.Services.IBudgetService, BankingAPI.Services.BudgetService>();
builder.Services.AddScoped<BankingAPI.Services.ILoanService, BankingAPI.Services.LoanService>();
builder.Services.AddScoped<BankingAPI.Services.IPaymentRequestService, BankingAPI.Services.PaymentRequestService>();
builder.Services.AddScoped<BankingAPI.Services.IUserService, BankingAPI.Services.UserService>();

// ===== Swagger / OpenAPI =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Banking API",
        Version = "v1",
        Description = "Personal Finance Banking API with JWT Authentication. " +
                      "Use the Authorize button to enter your JWT token.",
        Contact = new OpenApiContact
        {
            Name = "Banking API Support"
        }
    });

    // Add JWT Authentication to Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter your JWT token like: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments for Swagger
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// ===== Build the App =====
var app = builder.Build();

// ===== Database Migration & Seeding (Development Only) =====
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<BankingDbContext>();
        
        // Ensure the 'banking' schema exists before running migrations
        // (fresh PostgreSQL containers won't have it)
        await context.Database.ExecuteSqlRawAsync(
            "CREATE SCHEMA IF NOT EXISTS banking");
        
        // Auto-apply pending migrations (creates schema/tables if needed)
        await context.Database.MigrateAsync();
        
        // Seed test data
        await DatabaseSeeder.SeedDataAsync(context);
    }
}

// ===== Middleware Pipeline =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Banking API v1");
        options.DocumentTitle = "Banking API - Swagger";
    });
}

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

// CORS must be before authentication
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Welcome endpoint at root
app.MapGet("/", () => new
{
    message = "🏦 Banking API is running!",
    version = "1.0.0",
    timestamp = DateTime.UtcNow,
    endpoints = new
    {
        health = "/health",
        auth = new
        {
            register = "POST /api/auth/register",
            login = "POST /api/auth/login"
        },
        accounts = new
        {
            getAll = "GET /api/accounts",
            getById = "GET /api/accounts/{id}",
            create = "POST /api/accounts",
            update = "PUT /api/accounts/{id}",
            close = "DELETE /api/accounts/{id}",
            balance = "GET /api/accounts/{id}/balance"
        },
        transactions = new
        {
            getAll = "GET /api/transactions",
            getByAccount = "GET /api/transactions/account/{accountId}",
            getById = "GET /api/transactions/{id}",
            create = "POST /api/transactions",
            byCategory = "GET /api/transactions/category/{category}"
        }
    },
    swagger = "/swagger",
    note = "🔒 All endpoints except /health and /api/auth require JWT authentication"
}).WithName("Welcome");

// Health check endpoint
app.MapGet("/health", () => new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    database = "connected"
}).WithName("HealthCheck");

app.Run();
