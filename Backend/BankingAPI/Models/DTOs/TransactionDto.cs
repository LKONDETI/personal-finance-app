namespace BankingAPI.Models.DTOs;

/// <summary>
/// Transaction data transfer object
/// </summary>
public class TransactionDto
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public required string TransactionType { get; set; }
    public decimal Amount { get; set; }
    public required string Currency { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public DateTime TransactionTime { get; set; }
    public string Status { get; set; } = "Completed";
}
