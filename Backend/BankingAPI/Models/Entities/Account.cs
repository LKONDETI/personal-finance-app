namespace BankingAPI.Models.Entities;

/// <summary>
/// Represents a bank account belonging to a user.
/// Corresponds to the "accounts" table from Supabase.
/// </summary>
public class Account
{
    public int Id { get; set; }
    
    public int UserId { get; set; }  // Foreign key
    
    public required string AccountName { get; set; }
    
    public required string AccountNumber { get; set; }  // Unique identifier
    
    public required string ProductId { get; set; }
    
    public required string Currency { get; set; } = "USD";
    
    public decimal Balance { get; set; } = 0;
    
    public AccountStatus Status { get; set; } = AccountStatus.Active;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

/// <summary>
/// Account status enumeration
/// </summary>
public enum AccountStatus
{
    Active,
    Frozen,
    Closed
}
