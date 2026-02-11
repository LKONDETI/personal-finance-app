using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using BankingAPI.Configuration;
using BankingAPI.Data;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Authentication service implementing user registration, login, and JWT token generation
/// Uses BCrypt for secure password hashing
/// </summary>
public class AuthService : IAuthService
{
    private readonly BankingDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(BankingDbContext context, IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    /// <summary>
    /// Register a new user with BCrypt password hashing
    /// </summary>
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            return null; // User already exists
        }

        // Hash password using BCrypt (work factor 12 for production security)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        // Create new user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            Phone = request.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Log registration in audit log
        var auditLog = new AuditLog
        {
            UserId = user.Id,
            Action = "Register",
            EntityType = "User",
            EntityId = user.Id,
            Details = $"New user registered: {user.Email}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        return new AuthResponse
        {
            Token = token,
            User = MapToUserDto(user),
            ExpiresAt = expiresAt
        };
    }

    /// <summary>
    /// Authenticate user and generate JWT token
    /// </summary>
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return null; // User not found
        }

        // Check if user is active
        if (!user.IsActive)
        {
            return null; // Account deactivated
        }

        // Verify password using BCrypt
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return null; // Invalid password
        }

        // Log successful login
        var auditLog = new AuditLog
        {
            UserId = user.Id,
            Action = "Login",
            EntityType = "User",
            EntityId = user.Id,
            Details = $"User logged in: {user.Email}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        return new AuthResponse
        {
            Token = token,
            User = MapToUserDto(user),
            ExpiresAt = expiresAt
        };
    }

    /// <summary>
    /// Get user by ID (for authenticated requests)
    /// </summary>
    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user != null ? MapToUserDto(user) : null;
    }

    /// <summary>
    /// Generate JWT token for authenticated user
    /// Token contains: user ID, email, and expiration time
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name ?? user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token ID
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()) // Issued at
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Map User entity to UserDto (exclude sensitive data)
    /// </summary>
    private UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Phone = user.Phone,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
