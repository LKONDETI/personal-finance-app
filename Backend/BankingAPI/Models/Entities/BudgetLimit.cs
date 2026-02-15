namespace BankingAPI.Models.Entities;

/// <summary>
/// Represents budget limits set by users for different spending categories.
/// New table for budget management feature.
/// </summary>
public class BudgetLimit
{
    public int Id { get; set; }
    
    public int UserId { get; set; }  // Foreign key
    
    public required string Category { get; set; }
    
    public decimal MonthlyLimit { get; set; }
    
    public decimal CurrentSpending { get; set; } = 0;
    
    public int Month { get; set; }  // 1-12
    
    public int Year { get; set; }  // e.g. 2026
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}
