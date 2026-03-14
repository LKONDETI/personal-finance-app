namespace BankingAPI.Services;

using BankingAPI.Models.DTOs;

public interface IUserService
{
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> UpdateUserAsync(int id, UpdateProfileRequest request);
    Task<bool> ChangePasswordAsync(int id, string currentPassword, string newPassword);
}
