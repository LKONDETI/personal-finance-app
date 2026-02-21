namespace BankingAPI.Models.Entities;

/// <summary>
/// Represents a payment request (bill, subscription, utility) sent to a user.
/// Users can pay full, pay partial, or decline.
/// </summary>
public class PaymentRequest
{
    public int Id { get; set; }
    
    public int UserId { get; set; }  // Who needs to pay
    
    public int? AccountId { get; set; }  // Which account was used to pay (set on payment)
    
    public required string PayeeName { get; set; }  // e.g., "City Utilities"
    
    public required string PayeeCategory { get; set; }  // e.g., "Water & Electricity"
    
    public decimal Amount { get; set; }  // Total amount due
    
    public decimal AmountPaid { get; set; } = 0;  // How much has been paid so far
    
    public DateTime DueDate { get; set; }
    
    public DateTime? PaidDate { get; set; }  // When payment was made
    
    public PaymentRequestStatus Status { get; set; } = PaymentRequestStatus.Pending;
    
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Account? Account { get; set; }
}

/// <summary>
/// Payment request status enumeration
/// </summary>
public enum PaymentRequestStatus
{
    Pending,
    Paid,
    PartiallyPaid,
    Declined,
    Overdue
}
