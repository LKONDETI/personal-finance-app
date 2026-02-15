namespace BankingAPI.Models.DTOs;

/// <summary>
/// Loan data transfer object
/// </summary>
public class LoanDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string LoanType { get; set; }
    public decimal LoanAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int LoanTermMonths { get; set; }
    public decimal MonthlyPayment { get; set; }
    public decimal OutstandingBalance { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? ApprovalDate { get; set; }
    public DateTime? DisbursementDate { get; set; }
    public DateTime ApplicationDate { get; set; }
    public string? Purpose { get; set; }
}
