namespace BankingAPI.Models.DTOs;

/// <summary>
/// Account data transfer object
/// </summary>
public class AccountDto
{
    public int Id { get; set; }
    public required string AccountName { get; set; }
    public required string AccountNumber { get; set; }
    public required string ProductId { get; set; }
    public required string Currency { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
}
