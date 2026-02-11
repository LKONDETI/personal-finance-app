namespace BankingAPI.Models.DTOs;

/// <summary>
/// User data transfer object (without sensitive information)
/// </summary>
public class UserDto
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
