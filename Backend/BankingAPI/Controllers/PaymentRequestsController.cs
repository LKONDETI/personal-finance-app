using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankingAPI.Models.Entities;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// Payment request management controller.
/// Handles listing, paying (full/partial), and declining payment requests.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentRequestsController : ControllerBase
{
    private readonly IPaymentRequestService _service;
    private readonly ILogger<PaymentRequestsController> _logger;

    public PaymentRequestsController(IPaymentRequestService service, ILogger<PaymentRequestsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all payment requests for the authenticated user.
    /// Optionally filter by status (Pending, Paid, PartiallyPaid, Declined, Overdue).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPaymentRequests([FromQuery] string? status = null)
    {
        var userId = GetAuthenticatedUserId();
        
        PaymentRequestStatus? statusFilter = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<PaymentRequestStatus>(status, true, out var parsed))
        {
            statusFilter = parsed;
        }

        var requests = await _service.GetByUserIdAsync(userId, statusFilter);

        return Ok(new { success = true, data = requests });
    }

    /// <summary>
    /// Get a specific payment request by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPaymentRequest(int id)
    {
        var userId = GetAuthenticatedUserId();
        var request = await _service.GetByIdAsync(id, userId);

        if (request == null)
            return NotFound(new { success = false, message = "Payment request not found" });

        return Ok(new { success = true, data = request });
    }

    /// <summary>
    /// Pay the full remaining amount of a payment request.
    /// Creates a Debit transaction and updates account balance.
    /// </summary>
    [HttpPost("{id}/pay")]
    public async Task<IActionResult> PayFull(int id, [FromBody] PayRequest body)
    {
        try
        {
            var userId = GetAuthenticatedUserId();
            var result = await _service.PayFullAsync(id, userId, body.AccountId);

            // Prevent JSON circular reference cycle during serialization
            result.Account = null;

            return Ok(new { success = true, data = result, message = "Payment completed successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Pay a partial amount of a payment request.
    /// </summary>
    [HttpPost("{id}/pay-partial")]
    public async Task<IActionResult> PayPartial(int id, [FromBody] PartialPayRequest body)
    {
        try
        {
            var userId = GetAuthenticatedUserId();
            var result = await _service.PayPartialAsync(id, userId, body.AccountId, body.Amount);

            // Prevent JSON circular reference cycle during serialization
            result.Account = null;

            return Ok(new { success = true, data = result, message = "Partial payment completed successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Decline a payment request. No money is moved.
    /// </summary>
    [HttpPost("{id}/decline")]
    public async Task<IActionResult> Decline(int id)
    {
        try
        {
            var userId = GetAuthenticatedUserId();
            var result = await _service.DeclineAsync(id, userId);

            // Prevent JSON circular reference cycle during serialization
            result.Account = null;

            return Ok(new { success = true, data = result, message = "Payment request declined" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    private int GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }
}

/// <summary>Request body for full payment</summary>
public class PayRequest
{
    public int AccountId { get; set; }
}

/// <summary>Request body for partial payment</summary>
public class PartialPayRequest
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
}
