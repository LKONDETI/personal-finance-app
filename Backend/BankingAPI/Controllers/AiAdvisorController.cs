using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Amazon.BedrockRuntime;
using BankingAPI.Models.DTOs;
using BankingAPI.Services;

namespace BankingAPI.Controllers;

/// <summary>
/// AI Financial Advisor controller.
/// Accepts a plain-text question from the authenticated user, builds
/// an aggregated financial context from PostgreSQL, and returns an
/// AI-generated answer grounded solely in that context.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiAdvisorController : ControllerBase
{
    private readonly IFinancialContextService _contextService;
    private readonly IBedrockService _bedrockService;
    private readonly ILogger<AiAdvisorController> _logger;
    private readonly IConfiguration _configuration;

    public AiAdvisorController(
        IFinancialContextService contextService,
        IBedrockService bedrockService,
        ILogger<AiAdvisorController> logger,
        IConfiguration configuration)
    {
        _contextService = contextService;
        _bedrockService = bedrockService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Ask the AI advisor a question about your finances.
    /// The backend aggregates your transaction and budget data, then sends
    /// a structured summary (never raw rows) to the AI model.
    /// </summary>
    /// <param name="request">The user's financial question (max 1000 chars)</param>
    [HttpPost("ask")]
    [ProducesResponseType(typeof(ApiResponse<AiAdvisorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ask([FromBody] AiAdvisorRequest request)
    {
        try
        {
            // ── Auth ──────────────────────────────────────────────────────────
            var userId = GetAuthenticatedUserId();
            if (userId == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User not authenticated"
                });
            }

            // ── Input validation ──────────────────────────────────────────────
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Question cannot be empty"
                });
            }

            if (request.Question.Length > 1000)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Question must be 1000 characters or fewer",
                    Errors  = new List<string> { $"Received {request.Question.Length} characters" }
                });
            }

            _logger.LogInformation("AI Advisor question from user {UserId} ({Length} chars)", userId, request.Question.Length);

            // ── Build financial context ───────────────────────────────────────
            var context = await _contextService.BuildContextAsync(userId.Value);

            // ── Call Bedrock (or return mock) ─────────────────────────────────
            var answer    = await _bedrockService.AskAsync(request.Question, context);
            var isMock    = _configuration.GetValue<bool>("AiAdvisor:MockMode", true);

            return Ok(new ApiResponse<AiAdvisorResponse>
            {
                Success = true,
                Data    = new AiAdvisorResponse { Answer = answer, IsMockResponse = isMock },
                Message = "AI response generated successfully"
            });
        }
        catch (AmazonBedrockRuntimeException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            _logger.LogWarning(ex, "Bedrock throttled the request for user");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ApiResponse<object>
            {
                Success = false,
                Message = "AI service is temporarily busy. Please wait a moment and try again."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in AI Advisor for user {UserId}",
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse<object>
            {
                Success = false,
                Message = "An unexpected error occurred. Please try again."
            });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int? GetAuthenticatedUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }
}
