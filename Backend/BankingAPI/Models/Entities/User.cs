namespace BankingAPI.Models.Entities;

/// <summary>
/// Represents a user (customer) in the banking system.
/// This replaces the "customers" table from Supabase.
/// </summary>
public class User
{
    public int Id { get; set; }
    
    public required string Email { get; set; }
    
    public required string PasswordHash { get; set; }  // BCrypt hashed password
    
    public string? Name { get; set; }
    
    public string? Phone { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    
    public ICollection<BudgetLimit> BudgetLimits { get; set; } = new List<BudgetLimit>();
    
    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
}
