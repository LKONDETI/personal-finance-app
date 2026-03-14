using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankingAPI.Models.DTOs;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get current authenticated user's profile
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetAuthenticatedUserId();
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "User not authenticated"
            });
        }

        var user = await _userService.GetUserByIdAsync(userId.Value);
        if (user == null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "User not found"
            });
        }

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Data = user,
            Message = "User retrieved successfully"
        });
    }

    /// <summary>
    /// Update current authenticated user's profile
    /// </summary>
    [HttpPut("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateProfileRequest request)
    {
        var userId = GetAuthenticatedUserId();
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "User not authenticated"
            });
        }

        var updatedUser = await _userService.UpdateUserAsync(userId.Value, request);
        if (updatedUser == null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "User not found"
            });
        }

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Data = updatedUser,
            Message = "User updated successfully"
        });
    }

    /// <summary>
    /// Change current user's password
    /// </summary>
    [HttpPut("password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetAuthenticatedUserId();
        if (userId == null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "User not authenticated"
            });
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Current and new passwords are required"
            });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "New password must be at least 6 characters long"
            });
        }

        var success = await _userService.ChangePasswordAsync(userId.Value, request.CurrentPassword, request.NewPassword);
        
        if (!success)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Incorrect current password or user not found"
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Password changed successfully"
        });
    }

    private int? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

public class ChangePasswordRequest
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}
