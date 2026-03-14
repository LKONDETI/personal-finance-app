using Microsoft.EntityFrameworkCore;
using BankingAPI.Data;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Budget management service for tracking spending limits
/// </summary>
public class BudgetService : IBudgetService
{
    private readonly BankingDbContext _context;
    private readonly ILogger<BudgetService> _logger;

    public BudgetService(BankingDbContext context, ILogger<BudgetService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<BudgetDto>> GetUserBudgetsAsync(int userId)
    {
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        var budgets = await _context.BudgetLimits
            .Where(b => b.UserId == userId && b.Month == currentMonth && b.Year == currentYear)
            .ToListAsync();

        return budgets.Select(MapToBudgetDto);
    }

    public async Task<BudgetDto?> GetBudgetByIdAsync(int budgetId, int userId)
    {
        var budget = await _context.BudgetLimits
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        return budget != null ? MapToBudgetDto(budget) : null;
    }

    public async Task<BudgetDto?> GetBudgetByCategoryAsync(int userId, string category, int month, int year)
    {
        var budget = await _context.BudgetLimits
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == category && b.Month == month && b.Year == year);

        return budget != null ? MapToBudgetDto(budget) : null;
    }

    public async Task<BudgetDto?> CreateBudgetAsync(int userId, string category, decimal monthlyLimit, int month, int year)
    {
        // Upsert: update the limit if a budget already exists for this category/month/year
        var existing = await _context.BudgetLimits
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == category && b.Month == month && b.Year == year);

        if (existing != null)
        {
            existing.MonthlyLimit = monthlyLimit;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Budget upserted (updated) for user {UserId}: {Category} - {Limit:C}", userId, category, monthlyLimit);
            return MapToBudgetDto(existing);
        }

        var budget = new BudgetLimit
        {
            UserId = userId,
            Category = category,
            MonthlyLimit = monthlyLimit,
            CurrentSpending = 0,
            Month = month,
            Year = year,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.BudgetLimits.Add(budget);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Budget created for user {UserId}: {Category} - {Limit:C}", userId, category, monthlyLimit);

        return MapToBudgetDto(budget);
    }

    public async Task<BudgetDto?> UpdateBudgetAsync(int budgetId, int userId, decimal monthlyLimit)
    {
        var budget = await _context.BudgetLimits
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        if (budget == null)
        {
            return null;
        }

        budget.MonthlyLimit = monthlyLimit;
        budget.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Budget {BudgetId} updated for user {UserId}", budgetId, userId);

        return MapToBudgetDto(budget);
    }

    public async Task<bool> DeleteBudgetAsync(int budgetId, int userId)
    {
        var budget = await _context.BudgetLimits
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        if (budget == null)
        {
            return false;
        }

        _context.BudgetLimits.Remove(budget);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Budget {BudgetId} deleted for user {UserId}", budgetId, userId);

        return true;
    }

    public async Task UpdateSpendingAsync(int userId, string category, decimal amount, int month, int year)
    {
        var budget = await _context.BudgetLimits
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == category && b.Month == month && b.Year == year);

        if (budget != null)
        {
            budget.CurrentSpending += amount;
            budget.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private BudgetDto MapToBudgetDto(BudgetLimit budget)
    {
        return new BudgetDto
        {
            Id = budget.Id,
            UserId = budget.UserId,
            Category = budget.Category,
            MonthlyLimit = budget.MonthlyLimit,
            CurrentSpending = budget.CurrentSpending,
            Month = budget.Month,
            Year = budget.Year,
            CreatedAt = budget.CreatedAt,
            UpdatedAt = budget.UpdatedAt
        };
    }
}
