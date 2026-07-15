using Microsoft.EntityFrameworkCore;
using BankingAPI.Data;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Builds a structured, aggregated financial summary for a user from PostgreSQL via EF Core.
/// All grouping and math is done in the query or in C# — the model never receives raw rows.
/// </summary>
public class FinancialContextService : IFinancialContextService
{
    private readonly BankingDbContext _context;
    private readonly ILogger<FinancialContextService> _logger;

    public FinancialContextService(BankingDbContext context, ILogger<FinancialContextService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<FinancialContext> BuildContextAsync(int userId)
    {
        var now = DateTime.UtcNow;
        var threeMonthsAgo = now.AddMonths(-3);

        // ── 1. Accounts (active only) ──────────────────────────────────────────
        var accounts = await _context.Accounts
            .Where(a => a.UserId == userId && a.Status == AccountStatus.Active)
            .Select(a => new AccountSummary
            {
                AccountName = a.AccountName,
                Balance = a.Balance,
                Currency = a.Currency
            })
            .ToListAsync();

        // ── 2. Transactions — aggregated by category + type (last 3 months) ───
        //    We navigate Account → Transactions so we stay within this user's data.
        //    Only Completed transactions are included.
        var rawGroups = await _context.Transactions
            .Where(t => t.Account.UserId == userId
                     && t.TransactionTime >= threeMonthsAgo
                     && t.Status == TransactionStatus.Completed)
            .GroupBy(t => new { t.Category, t.TransactionType })
            .Select(g => new
            {
                Category       = g.Key.Category ?? "Uncategorized",
                Type           = g.Key.TransactionType,
                TotalAmount    = g.Sum(t => t.Amount),
                Count          = g.Count()
            })
            .ToListAsync();

        var totalIncome   = rawGroups.Where(g => g.Type == TransactionType.Credit).Sum(g => g.TotalAmount);
        var totalExpenses = rawGroups.Where(g => g.Type == TransactionType.Debit).Sum(g => g.TotalAmount);

        // Roll up multiple debit groups with the same category into one line
        var spendingByCategory = rawGroups
            .Where(g => g.Type == TransactionType.Debit)
            .GroupBy(g => g.Category)
            .Select(g => new CategorySpending
            {
                Category         = g.Key,
                TotalSpent       = g.Sum(x => x.TotalAmount),
                TransactionCount = g.Sum(x => x.Count)
            })
            .OrderByDescending(c => c.TotalSpent)
            .ToList();

        // ── 3. Budget limits for the current calendar month ───────────────────
        var limits = await _context.BudgetLimits
            .Where(b => b.UserId == userId && b.Month == now.Month && b.Year == now.Year)
            .ToListAsync();

        var budgetSummaries = limits.Select(b => new BudgetSummary
        {
            Category           = b.Category,
            Limit              = b.MonthlyLimit,
            Spent              = b.CurrentSpending,
            RemainingAmount    = b.MonthlyLimit - b.CurrentSpending,
            IsOverBudget       = b.CurrentSpending > b.MonthlyLimit,
            UtilizationPercent = b.MonthlyLimit > 0
                                     ? Math.Round((b.CurrentSpending / b.MonthlyLimit) * 100, 1)
                                     : 0m
        }).ToList();

        _logger.LogInformation(
            "Financial context built for user {UserId}: {Accounts} accounts, " +
            "{Groups} tx groups, {Budgets} budget categories",
            userId, accounts.Count, rawGroups.Count, budgetSummaries.Count);

        return new FinancialContext
        {
            Period             = $"Last 3 months up to {now:MMMM yyyy}",
            TotalIncome        = totalIncome,
            TotalExpenses      = totalExpenses,
            NetCashFlow        = totalIncome - totalExpenses,
            SpendingByCategory = spendingByCategory,
            BudgetLimits       = budgetSummaries,
            Accounts           = accounts
        };
    }
}
