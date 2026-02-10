namespace BankingAPI.Models.Entities;

/// <summary>
/// Represents a financial transaction.
/// Corresponds to the "transactions" table from Supabase.
/// </summary>
public class Transaction
{
    public int Id { get; set; }
    
    public int AccountId { get; set; }  // Foreign key
    
    public required TransactionType TransactionType { get; set; }
    
    public decimal Amount { get; set; }
    
    public required string Currency { get; set; } = "USD";
    
    public string? Category { get; set; }  // e.g., "Food", "Transport", "Entertainment"
    
    public string? Description { get; set; }
    
    public DateTime TransactionTime { get; set; } = DateTime.UtcNow;
    
    public TransactionStatus Status { get; set; } = TransactionStatus.Completed;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Account Account { get; set; } = null!;
}

/// <summary>
/// Transaction type enumeration
/// </summary>
public enum TransactionType
{
    Debit,   // Money out
    Credit   // Money in
}

/// <summary>
/// Transaction status enumeration
/// </summary>
public enum TransactionStatus
{
    Pending,
    Completed,
    Failed,
    Cancelled
}
