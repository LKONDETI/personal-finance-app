namespace BankingAPI.Models.DTOs;

/// <summary>
/// Budget limit data transfer object
/// </summary>
public class BudgetDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string Category { get; set; }
    public decimal MonthlyLimit { get; set; }
    public decimal CurrentSpending { get; set; }
    public decimal RemainingBudget => MonthlyLimit - CurrentSpending;
    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
