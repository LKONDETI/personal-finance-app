using BankingAPI.Models.DTOs;

namespace BankingAPI.Services;

/// <summary>
/// Builds a structured financial context summary for a given user.
/// Aggregates transactions and budget data so the AI model receives
/// pre-computed totals — never raw rows.
/// </summary>
public interface IFinancialContextService
{
    /// <summary>
    /// Queries the database for the user's accounts, last 3 months of
    /// transaction totals by category, and current month budget status.
    /// </summary>
    Task<FinancialContext> BuildContextAsync(int userId);
}
