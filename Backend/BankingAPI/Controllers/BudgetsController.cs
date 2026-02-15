using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankingAPI.Models.DTOs;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// Budget management controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;
    private readonly ILogger<BudgetsController> _logger;

    public BudgetsController(IBudgetService budgetService, ILogger<BudgetsController> logger)
    {
        _budgetService = budgetService;
        _logger = logger;
    }

    /// <summary>
    /// Get all budgets for the authenticated user (current month)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BudgetDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBudgets()
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

            var budgets = await _budgetService.GetUserBudgetsAsync(userId.Value);

            return Ok(new ApiResponse<IEnumerable<BudgetDto>>
            {
                Success = true,
                Data = budgets,
                Message = "Budgets retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budgets");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get a specific budget by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BudgetDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBudget(int id)
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

            var budget = await _budgetService.GetBudgetByIdAsync(id, userId.Value);

            if (budget == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Budget not found"
                });
            }

            return Ok(new ApiResponse<BudgetDto>
            {
                Success = true,
                Data = budget,
                Message = "Budget retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget {BudgetId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Create a new budget
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BudgetDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetRequest request)
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

            if (string.IsNullOrWhiteSpace(request.Category))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Category is required"
                });
            }

            if (request.MonthlyLimit <= 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Monthly limit must be greater than zero"
                });
            }

            var budget = await _budgetService.CreateBudgetAsync(
                userId.Value,
                request.Category,
                request.MonthlyLimit,
                request.Month ?? DateTime.UtcNow.Month,
                request.Year ?? DateTime.UtcNow.Year
            );

            if (budget == null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Budget already exists for this category and period"
                });
            }

            return CreatedAtAction(
                nameof(GetBudget),
                new { id = budget.Id },
                new ApiResponse<BudgetDto>
                {
                    Success = true,
                    Data = budget,
                    Message = "Budget created successfully"
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating budget");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Update budget monthly limit
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BudgetDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetRequest request)
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

            if (request.MonthlyLimit <= 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Monthly limit must be greater than zero"
                });
            }

            var budget = await _budgetService.UpdateBudgetAsync(id, userId.Value, request.MonthlyLimit);

            if (budget == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Budget not found"
                });
            }

            return Ok(new ApiResponse<BudgetDto>
            {
                Success = true,
                Data = budget,
                Message = "Budget updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating budget {BudgetId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Delete a budget
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBudget(int id)
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

            var success = await _budgetService.DeleteBudgetAsync(id, userId.Value);

            if (!success)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Budget not found"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Budget deleted successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting budget {BudgetId}", id);
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

public class CreateBudgetRequest
{
    public required string Category { get; set; }
    public decimal MonthlyLimit { get; set; }
    public int? Month { get; set; }
    public int? Year { get; set; }
}

public class UpdateBudgetRequest
{
    public decimal MonthlyLimit { get; set; }
}
