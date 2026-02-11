using Microsoft.AspNetCore.Mvc;
using BankingAPI.Models.DTOs;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// Authentication controller for user registration and login
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Email and password are required",
                    Errors = new List<string> { "Invalid request data" }
                });
            }

            // Validate email format
            if (!IsValidEmail(request.Email))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid email format",
                    Errors = new List<string> { "Please provide a valid email address" }
                });
            }

            // Validate password strength (minimum 6 characters for now)
            if (request.Password.Length < 6)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Password too weak",
                    Errors = new List<string> { "Password must be at least 6 characters long" }
                });
            }

            var result = await _authService.RegisterAsync(request);

            if (result == null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User already exists",
                    Errors = new List<string> { "An account with this email already exists" }
                });
            }

            _logger.LogInformation("User registered successfully: {Email}", request.Email);

            return Ok(new ApiResponse<AuthResponse>
            {
                Success = true,
                Data = result,
                Message = "Registration successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error",
                Errors = new List<string> { "An error occurred during registration" }
            });
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Email and password are required",
                    Errors = new List<string> { "Invalid request data" }
                });
            }

            var result = await _authService.LoginAsync(request);

            if (result == null)
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid credentials",
                    Errors = new List<string> { "Email or password is incorrect" }
                });
            }

            _logger.LogInformation("User logged in successfully: {Email}", request.Email);

            return Ok(new ApiResponse<AuthResponse>
            {
                Success = true,
                Data = result,
                Message = "Login successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error",
                Errors = new List<string> { "An error occurred during login" }
            });
        }
    }

    /// <summary>
    /// Simple email validation
    /// </summary>
    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
