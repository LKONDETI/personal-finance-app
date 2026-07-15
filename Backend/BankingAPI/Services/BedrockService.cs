using System.Text;
using Amazon;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using BankingAPI.Models.DTOs;

namespace BankingAPI.Services;

/// <summary>
/// Calls Amazon Bedrock's Converse API (Nova Lite by default).
/// When AiAdvisor:MockMode = true the service returns a canned response
/// immediately — no AWS credentials needed, zero cost.
/// </summary>
public class BedrockService : IBedrockService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<BedrockService> _logger;

    /// <summary>
    /// System prompt injected on every call.
    /// The model is instructed to use only the provided context and never invent numbers.
    /// </summary>
    private const string SystemPrompt = """
        You are a personal financial advisor assistant embedded in a banking app.
        Rules you must always follow:
        1. Only use the financial data provided in the [MY FINANCIAL CONTEXT] block to answer questions.
        2. Never invent, estimate, or extrapolate numbers, account names, or percentages that are not in the context.
        3. If you cannot answer from the provided data, say clearly: "I don't have enough information to answer that."
        4. Keep responses concise, friendly, and actionable — aim for 3-5 sentences unless more detail is clearly needed.
        5. Format currency values as USD (e.g. $1,234.56).
        6. Do not discuss topics unrelated to personal finance.
        """;

    public BedrockService(IConfiguration configuration, ILogger<BedrockService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> AskAsync(string userQuestion, FinancialContext context)
    {
        // ── Mock mode: return canned response, zero AWS cost ─────────────────
        var mockMode = _configuration.GetValue<bool>("AiAdvisor:MockMode", true);
        if (mockMode)
        {
            _logger.LogInformation("AI Advisor is in mock mode — skipping Bedrock call");
            return BuildMockResponse(context);
        }

        // ── Live mode: call Bedrock Converse API ──────────────────────────────
        var region   = _configuration["AiAdvisor:Region"]  ?? "us-east-1";
        var modelId  = _configuration["AiAdvisor:ModelId"] ?? "amazon.nova-lite-v1:0";
        var maxTokens = _configuration.GetValue<int>("AiAdvisor:MaxTokens", 512);

        try
        {
            var client = new AmazonBedrockRuntimeClient(RegionEndpoint.GetBySystemName(region));

            // Build a human-readable context block — the model reads this, never raw DB rows
            var contextBlock = BuildContextBlock(context);
            var fullUserMessage = $"""
                [MY FINANCIAL CONTEXT]
                {contextBlock}

                [MY QUESTION]
                {userQuestion}
                """;

            var request = new ConverseRequest
            {
                ModelId = modelId,
                System  = new List<SystemContentBlock>
                {
                    new SystemContentBlock { Text = SystemPrompt }
                },
                Messages = new List<Message>
                {
                    new Message
                    {
                        Role    = ConversationRole.User,
                        Content = new List<ContentBlock>
                        {
                            new ContentBlock { Text = fullUserMessage }
                        }
                    }
                },
                InferenceConfig = new InferenceConfiguration
                {
                    MaxTokens   = maxTokens,
                    Temperature = 0.3F  // Lower = more factual, less hallucination-prone
                }
            };

            var response = await client.ConverseAsync(request);
            var answer   = response.Output?.Message?.Content?.FirstOrDefault()?.Text
                           ?? "I was unable to generate a response. Please try again.";

            _logger.LogInformation(
                "Bedrock call successful. Model: {Model}, Input tokens: {In}, Output tokens: {Out}",
                modelId, response.Usage?.InputTokens, response.Usage?.OutputTokens);

            return answer;
        }
        catch (AmazonBedrockRuntimeException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            _logger.LogWarning(ex, "Bedrock request was throttled");
            throw; // Let the controller return 503
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Amazon Bedrock (model: {Model}, region: {Region})", modelId, region);
            throw;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Serialises the FinancialContext into a compact, human-readable text block
    /// that the model can parse reliably.
    /// </summary>
    private static string BuildContextBlock(FinancialContext ctx)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Period: {ctx.Period}");
        sb.AppendLine($"Total Income:   ${ctx.TotalIncome:N2}");
        sb.AppendLine($"Total Expenses: ${ctx.TotalExpenses:N2}");
        sb.AppendLine($"Net Cash Flow:  ${ctx.NetCashFlow:N2}");

        if (ctx.Accounts.Count > 0)
        {
            sb.AppendLine("\nAccounts:");
            foreach (var acc in ctx.Accounts)
                sb.AppendLine($"  - {acc.AccountName}: ${acc.Balance:N2} {acc.Currency}");
        }

        if (ctx.SpendingByCategory.Count > 0)
        {
            sb.AppendLine("\nSpending by Category (debits, last 3 months):");
            foreach (var cat in ctx.SpendingByCategory)
                sb.AppendLine($"  - {cat.Category}: ${cat.TotalSpent:N2} ({cat.TransactionCount} transactions)");
        }

        if (ctx.BudgetLimits.Count > 0)
        {
            sb.AppendLine("\nBudget Status (this month):");
            foreach (var b in ctx.BudgetLimits)
            {
                var status = b.IsOverBudget
                    ? "⚠ OVER BUDGET"
                    : $"{b.UtilizationPercent}% used";
                sb.AppendLine(
                    $"  - {b.Category}: ${b.Spent:N2} of ${b.Limit:N2} limit " +
                    $"({status}, ${b.RemainingAmount:N2} remaining)");
            }
        }
        else
        {
            sb.AppendLine("\nBudget Limits: None set for this month.");
        }

        return sb.ToString();
    }

    /// <summary>
    /// Returns a canned mock response that references the user's real aggregated data,
    /// so the UI looks realistic even without AWS credentials.
    /// </summary>
    private static string BuildMockResponse(FinancialContext ctx)
    {
        var overBudgetCount = ctx.BudgetLimits.Count(b => b.IsOverBudget);
        var budgetNote = overBudgetCount > 0
            ? $"⚠️ You're over budget in {overBudgetCount} category(ies) — consider reviewing your spending there."
            : ctx.BudgetLimits.Count > 0
                ? "✅ You're within budget in all tracked categories — great work!"
                : "📝 You haven't set any budget limits yet. Try setting some in Settings → Budget Limits.";

        return $"""
            👋 Hi! I'm your AI financial advisor (running in demo mode).

            Here's a snapshot of your finances for {ctx.Period}:
            • Total income:   ${ctx.TotalIncome:N2}
            • Total expenses: ${ctx.TotalExpenses:N2}
            • Net cash flow:  ${ctx.NetCashFlow:N2}

            You have {ctx.Accounts.Count} active account(s) and {ctx.BudgetLimits.Count} budget category(ies) configured.

            {budgetNote}

            (This is a demo response. To enable real AI-powered advice, set AI_MOCK_MODE=false and add your AWS credentials.)
            """;
    }
}
