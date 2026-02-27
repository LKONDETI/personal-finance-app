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

/// <summary>
/// Request model for updating a user's profile
/// </summary>
public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
}
