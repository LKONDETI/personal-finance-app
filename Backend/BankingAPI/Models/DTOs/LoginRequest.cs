namespace BankingAPI.Models.DTOs;

/// <summary>
/// Request model for user login
/// </summary>
public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
