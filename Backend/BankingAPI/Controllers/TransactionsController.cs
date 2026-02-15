using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// Transaction management controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly ILogger<TransactionsController> _logger;

    public TransactionsController(ITransactionService transactionService, ILogger<TransactionsController> logger)
    {
        _transactionService = transactionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all transactions for the authenticated user
    /// </summary>
    /// <param name="limit">Number of transactions to return (default 50, max 200)</param>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactions([FromQuery] int limit = 50)
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

            // Limit max to 200
            limit = Math.Min(limit, 200);

            var transactions = await _transactionService.GetUserTransactionsAsync(userId.Value, limit);

            return Ok(new ApiResponse<IEnumerable<TransactionDto>>
            {
                Success = true,
                Data = transactions,
                Message = "Transactions retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get transactions for a specific account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    [HttpGet("account/{accountId}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAccountTransactions(int accountId)
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

            var transactions = await _transactionService.GetAccountTransactionsAsync(accountId, userId.Value);

            return Ok(new ApiResponse<IEnumerable<TransactionDto>>
            {
                Success = true,
                Data = transactions,
                Message = "Account transactions retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for account {AccountId}", accountId);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get a specific transaction by ID
    /// </summary>
    /// <param name="id">Transaction ID</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransaction(int id)
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

            var transaction = await _transactionService.GetTransactionByIdAsync(id, userId.Value);

            if (transaction == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Transaction not found"
                });
            }

            return Ok(new ApiResponse<TransactionDto>
            {
                Success = true,
                Data = transaction,
                Message = "Transaction retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction {TransactionId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Create a new transaction
    /// </summary>
    /// <param name="request">Transaction details</param>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequest request)
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
            if (request.Amount <= 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Amount must be greater than zero"
                });
            }

            if (!Enum.TryParse<TransactionType>(request.TransactionType, true, out var transactionType))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid transaction type. Use 'Credit' or 'Debit'"
                });
            }

            var transaction = await _transactionService.CreateTransactionAsync(
                request.AccountId,
                userId.Value,
                transactionType,
                request.Amount,
                request.Category,
                request.Description
            );

            if (transaction == null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to create transaction",
                    Errors = new List<string> { "Invalid account, insufficient funds, or inactive account" }
                });
            }

            return CreatedAtAction(
                nameof(GetTransaction),
                new { id = transaction.Id },
                new ApiResponse<TransactionDto>
                {
                    Success = true,
                    Data = transaction,
                    Message = "Transaction created successfully"
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transaction");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get transactions by category
    /// </summary>
    /// <param name="category">Category name</param>
    [HttpGet("category/{category}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactionsByCategory(string category)
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

            var transactions = await _transactionService.GetTransactionsByCategoryAsync(userId.Value, category);

            return Ok(new ApiResponse<IEnumerable<TransactionDto>>
            {
                Success = true,
                Data = transactions,
                Message = $"Transactions in category '{category}' retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for category {Category}", category);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    private int? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

/// <summary>
/// Request model for creating a transaction
/// </summary>
public class CreateTransactionRequest
{
    public int AccountId { get; set; }
    public required string TransactionType { get; set; } // "Credit" or "Debit"
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
}
