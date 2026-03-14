using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// Loan management controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoansController : ControllerBase
{
    private readonly ILoanService _loanService;
    private readonly ILogger<LoansController> _logger;

    public LoansController(ILoanService loanService, ILogger<LoansController> logger)
    {
        _loanService = loanService;
        _logger = logger;
    }

    /// <summary>
    /// Get all loans for the authenticated user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LoanDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLoans([FromQuery] string? status = null)
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

            IEnumerable<LoanDto> loans;

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<LoanStatus>(status, true, out var loanStatus))
            {
                loans = await _loanService.GetLoansByStatusAsync(userId.Value, loanStatus);
            }
            else
            {
                loans = await _loanService.GetUserLoansAsync(userId.Value);
            }

            return Ok(new ApiResponse<IEnumerable<LoanDto>>
            {
                Success = true,
                Data = loans,
                Message = "Loans retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving loans");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Get a specific loan by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LoanDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLoan(int id)
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

            var loan = await _loanService.GetLoanByIdAsync(id, userId.Value);

            if (loan == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loan not found"
                });
            }

            return Ok(new ApiResponse<LoanDto>
            {
                Success = true,
                Data = loan,
                Message = "Loan retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving loan {LoanId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Apply for a new loan
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LoanDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApplyForLoan([FromBody] ApplyLoanRequest request)
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
            if (string.IsNullOrWhiteSpace(request.LoanType))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loan type is required"
                });
            }

            if (request.LoanAmount <= 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loan amount must be greater than zero"
                });
            }

            if (request.LoanTermMonths <= 0 || request.LoanTermMonths > 360)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loan term must be between 1 and 360 months"
                });
            }

            var loan = await _loanService.ApplyForLoanAsync(
                userId.Value,
                request.LoanType,
                request.LoanAmount,
                request.LoanTermMonths,
                request.Purpose
            );

            if (loan == null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to submit loan application"
                });
            }

            return CreatedAtAction(
                nameof(GetLoan),
                new { id = loan.Id },
                new ApiResponse<LoanDto>
                {
                    Success = true,
                    Data = loan,
                    Message = "Loan application submitted successfully"
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying for loan");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Update loan status (admin function - for testing purposes user can update their own)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LoanDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLoanStatus(int id, [FromBody] UpdateLoanStatusRequest request)
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

            if (!Enum.TryParse<LoanStatus>(request.Status, true, out var loanStatus))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid loan status"
                });
            }

            var loan = await _loanService.UpdateLoanStatusAsync(id, userId.Value, loanStatus);

            if (loan == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loan not found"
                });
            }

            return Ok(new ApiResponse<LoanDto>
            {
                Success = true,
                Data = loan,
                Message = "Loan status updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating loan {LoanId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    /// <summary>
    /// Withdraw a pending loan application
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> WithdrawLoan(int id, [FromBody] WithdrawLoanRequest request)
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

            // Fetch the loan first to verify ownership and status
            var loan = await _loanService.GetLoanByIdAsync(id, userId.Value);

            if (loan == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Loan not found"
                });
            }

            if (!string.Equals(loan.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Only pending loan applications can be withdrawn"
                });
            }

            await _loanService.UpdateLoanStatusAsync(id, userId.Value, LoanStatus.Withdrawn);

            _logger.LogInformation("Loan {LoanId} withdrawn by user {UserId}. Reason: {Reason}", id, userId.Value, request.Reason);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Loan application withdrawn successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error withdrawing loan {LoanId}", id);
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

public class ApplyLoanRequest
{
    public required string LoanType { get; set; }
    public decimal LoanAmount { get; set; }
    public int LoanTermMonths { get; set; }
    public string? Purpose { get; set; }
}

public class UpdateLoanStatusRequest
{
    public required string Status { get; set; } // Pending, Approved, Rejected, Disbursed, Closed
}

public class WithdrawLoanRequest
{
    public string? Reason { get; set; }
}
