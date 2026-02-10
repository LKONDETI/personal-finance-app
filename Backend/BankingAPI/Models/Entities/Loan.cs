namespace BankingAPI.Models.Entities;

/// <summary>
/// Represents a loan application/account.
/// New table for loan management feature.
/// </summary>
public class Loan
{
    public int Id { get; set; }
    
    public int UserId { get; set; }  // Foreign key
    
    public decimal Amount { get; set; }
    
    public decimal InterestRate { get; set; }  // Annual percentage rate
    
    public int TermMonths { get; set; }  // Loan term in months
    
    public decimal MonthlyPayment { get; set; }
    
    public decimal OutstandingBalance { get; set; }
    
    public LoanStatus Status { get; set; } = LoanStatus.Pending;
    
    public DateTime? ApplicationDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? ApprovalDate { get; set; }
    
    public DateTime? DisbursementDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}

/// <summary>
/// Loan status enumeration
/// </summary>
public enum LoanStatus
{
    Pending,      // Application submitted, awaiting review
    Approved,     // Approved but not disbursed
    Active,       // Loan disbursed and active
    Rejected,     // Application rejected
    PaidOff,      // Loan fully repaid
    Defaulted     // Loan in default
}
