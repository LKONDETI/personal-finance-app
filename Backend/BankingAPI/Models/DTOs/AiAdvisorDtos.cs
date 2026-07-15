namespace BankingAPI.Models.DTOs;

/// <summary>
/// Request body for the AI Advisor endpoint.
/// </summary>
public class AiAdvisorRequest
{
    /// <summary>
    /// The user's financial question. Max 1000 characters.
    /// </summary>
    public required string Question { get; set; }
}

/// <summary>
/// Response returned by the AI Advisor endpoint.
/// </summary>
public class AiAdvisorResponse
{
    /// <summary>
    /// The AI-generated answer grounded in the user's financial context.
    /// </summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// True when AI_MOCK_MODE is enabled — no real Bedrock call was made.
    /// </summary>
    public bool IsMockResponse { get; set; }
}

/// <summary>
/// Aggregated financial snapshot passed to Bedrock as context.
/// The model never sees raw transaction rows — only this structured summary.
/// </summary>
public class FinancialContext
{
    public string Period { get; set; } = string.Empty;
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetCashFlow { get; set; }
    public List<CategorySpending> SpendingByCategory { get; set; } = new();
    public List<BudgetSummary> BudgetLimits { get; set; } = new();
    public List<AccountSummary> Accounts { get; set; } = new();
}

/// <summary>
/// Spending total for a single category, aggregated across the context window.
/// </summary>
public class CategorySpending
{
    public string Category { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int TransactionCount { get; set; }
}

/// <summary>
/// Budget limit status for a single category this month.
/// All math (utilization %, remaining) is pre-computed here — the model just reads it.
/// </summary>
public class BudgetSummary
{
    public string Category { get; set; } = string.Empty;
    public decimal Limit { get; set; }
    public decimal Spent { get; set; }
    public decimal RemainingAmount { get; set; }
    public bool IsOverBudget { get; set; }
    public decimal UtilizationPercent { get; set; }
}

/// <summary>
/// High-level account balance snapshot.
/// </summary>
public class AccountSummary
{
    public string AccountName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = string.Empty;
}
