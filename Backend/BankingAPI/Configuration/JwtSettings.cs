namespace BankingAPI.Configuration;

/// <summary>
/// JWT settings for authentication.
/// These values are loaded from appsettings.json or environment variables.
/// </summary>
public class JwtSettings
{
    public required string SecretKey { get; set; }
    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public int ExpirationMinutes { get; set; } = 60;  // Token expiration (default 1 hour)
    public int RefreshTokenExpirationDays { get; set; } = 7;  // Refresh token (default 7 days)
}
