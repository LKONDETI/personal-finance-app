using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Interface for loan management service
/// </summary>
public interface ILoanService
{
    Task<IEnumerable<LoanDto>> GetUserLoansAsync(int userId);
    Task<LoanDto?> GetLoanByIdAsync(int loanId, int userId);
    Task<LoanDto?> ApplyForLoanAsync(int userId, string loanType, decimal loanAmount, int loanTermMonths, string? purpose);
    Task<LoanDto?> UpdateLoanStatusAsync(int loanId, int userId, LoanStatus newStatus);
    Task<IEnumerable<LoanDto>> GetLoansByStatusAsync(int userId, LoanStatus status);
}
