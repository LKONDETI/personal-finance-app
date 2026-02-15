using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankingAPI.Models.DTOs;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// Account management controller - requires authentication
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints require JWT authentication
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly ILogger<AccountsController> _logger;

    public AccountsController(IAccountService accountService, ILogger<AccountsController> logger)
    {
        _accountService = accountService;
        _logger = logger;
    }

    /// <summary>
    /// Get all accounts for the authenticated user
    /// </summary>
    /// <returns>List of user's accounts</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AccountDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAccounts()
    {
        try
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User not authenticated",
                    Errors = new List<string> { "Invalid authentication token" }
                });
            }

            var accounts = await _accountService.GetUserAccountsAsync(userId.Value);

            return Ok(new ApiResponse<IEnumerable<AccountDto>>
            {
                Success = true,
                Data = accounts,
                Message = "Accounts retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving accounts");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error",
                Errors = new List<string> { "Failed to retrieve accounts" }
            });
        }
    }

    /// <summary>
    /// Get a specific account by ID
    /// </summary>
    /// <param name="id">Account ID</param>
    /// <returns>Account details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AccountDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccount(int id)
    {
        try
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

            var account = await _accountService.GetAccountByIdAsync(id, userId.Value);

            if (account == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Account not found",
                    Errors = new List<string> { "Account does not exist or you don't have access" }
                });
            }

            return Ok(new ApiResponse<AccountDto>
            {
                Success = true,
                Data = account,
                Message = "Account retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving account {AccountId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Create a new account
    /// </summary>
    /// <param name="request">Account creation details</param>
    /// <returns>Created account</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AccountDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        try
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

            // Validation
            if (string.IsNullOrWhiteSpace(request.AccountName))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Account name is required",
                    Errors = new List<string> { "Please provide a valid account name" }
                });
            }

            if (string.IsNullOrWhiteSpace(request.ProductId))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Product ID is required",
                    Errors = new List<string> { "Please specify the account product type" }
                });
            }

            var account = await _accountService.CreateAccountAsync(
                userId.Value,
                request.AccountName,
                request.ProductId
            );

            if (account == null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to create account"
                });
            }

            _logger.LogInformation("Account created for user {UserId}: {AccountId}", userId.Value, account.Id);

            return CreatedAtAction(
                nameof(GetAccount),
                new { id = account.Id },
                new ApiResponse<AccountDto>
                {
                    Success = true,
                    Data = account,
                    Message = "Account created successfully"
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating account");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Update account name
    /// </summary>
    /// <param name="id">Account ID</param>
    /// <param name="request">Update details</param>
    /// <returns>Updated account</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AccountDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAccount(int id, [FromBody] UpdateAccountRequest request)
    {
        try
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

            if (string.IsNullOrWhiteSpace(request.AccountName))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Account name is required"
                });
            }

            var account = await _accountService.UpdateAccountAsync(id, userId.Value, request.AccountName);

            if (account == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Account not found"
                });
            }

            return Ok(new ApiResponse<AccountDto>
            {
                Success = true,
                Data = account,
                Message = "Account updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating account {AccountId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Close an account (soft delete)
    /// </summary>
    /// <param name="id">Account ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CloseAccount(int id)
    {
        try
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

            var success = await _accountService.DeleteAccountAsync(id, userId.Value);

            if (!success)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Cannot close account",
                    Errors = new List<string> { "Account not found or has non-zero balance" }
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Account closed successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing account {AccountId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get account balance
    /// </summary>
    /// <param name="id">Account ID</param>
    /// <returns>Account balance</returns>
    [HttpGet("{id}/balance")]
    [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBalance(int id)
    {
        try
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

            var balance = await _accountService.GetAccountBalanceAsync(id, userId.Value);

            return Ok(new ApiResponse<decimal>
            {
                Success = true,
                Data = balance,
                Message = "Balance retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting balance for account {AccountId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get authenticated user ID from JWT token claims
    /// </summary>
    private int? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

/// <summary>
/// Request model for creating an account
/// </summary>
public class CreateAccountRequest
{
    public required string AccountName { get; set; }
    public required string ProductId { get; set; }
}

/// <summary>
/// Request model for updating an account
/// </summary>
public class UpdateAccountRequest
{
    public required string AccountName { get; set; }
}
