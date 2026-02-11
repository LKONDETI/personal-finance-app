namespace BankingAPI.Models.DTOs;

/// <summary>
/// Request model for user registration
/// </summary>
public class RegisterRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
}
