namespace BankingAPI.Models.Entities;

/// <summary>
/// Audit log for tracking important actions in the system.
/// Critical for security and compliance in a banking application.
/// </summary>
public class AuditLog
{
    public int Id { get; set; }
    
    public int? UserId { get; set; }  // Nullable for system actions
    
    public required string Action { get; set; }  // e.g., "Login", "Transfer", "UpdateProfile"
    
    public required string EntityType { get; set; }  // e.g., "User", "Transaction", "Account"
    
    public int? EntityId { get; set; }  // ID of the affected entity
    
    public string? Details { get; set; }  // JSON with additional details
    
    public string? IpAddress { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // Navigation property (nullable because system actions don't have a user)
    public User? User { get; set; }
}
