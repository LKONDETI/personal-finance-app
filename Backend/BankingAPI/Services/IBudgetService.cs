using BankingAPI.Models.DTOs;

namespace BankingAPI.Services;

/// <summary>
/// Interface for budget management service
/// </summary>
public interface IBudgetService
{
    Task<IEnumerable<BudgetDto>> GetUserBudgetsAsync(int userId);
    Task<BudgetDto?> GetBudgetByIdAsync(int budgetId, int userId);
    Task<BudgetDto?> GetBudgetByCategoryAsync(int userId, string category, int month, int year);
    Task<BudgetDto?> CreateBudgetAsync(int userId, string category, decimal monthlyLimit, int month, int year);
    Task<BudgetDto?> UpdateBudgetAsync(int budgetId, int userId, decimal monthlyLimit);
    Task<bool> DeleteBudgetAsync(int budgetId, int userId);
    Task UpdateSpendingAsync(int userId, string category, decimal amount, int month, int year);
}
