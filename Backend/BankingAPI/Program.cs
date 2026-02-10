using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
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
        policy.WithOrigins(
                "http://localhost:8081",           // Expo default port
                "exp://localhost:8081",            // Expo URL scheme
                "http://192.168.1.183:8081"        // Local network (update with your IP)
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add Swagger/OpenAPI for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== Build the App =====
var app = builder.Build();

// ===== Middleware Pipeline =====
// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
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

// Health check endpoint
app.MapGet("/health", () => new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    database = "connected"
}).WithName("HealthCheck");

app.Run();
