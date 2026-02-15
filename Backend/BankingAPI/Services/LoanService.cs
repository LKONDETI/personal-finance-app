using Microsoft.EntityFrameworkCore;
using BankingAPI.Data;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Loan management service
/// </summary>
public class LoanService : ILoanService
{
    private readonly BankingDbContext _context;
    private readonly ILogger<LoanService> _logger;

    public LoanService(BankingDbContext context, ILogger<LoanService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<LoanDto>> GetUserLoansAsync(int userId)
    {
        var loans = await _context.Loans
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.ApplicationDate)
            .ToListAsync();

        return loans.Select(MapToLoanDto);
    }

    public async Task<LoanDto?> GetLoanByIdAsync(int loanId, int userId)
    {
        var loan = await _context.Loans
            .FirstOrDefaultAsync(l => l.Id == loanId && l.UserId == userId);

        return loan != null ? MapToLoanDto(loan) : null;
    }

    public async Task<LoanDto?> ApplyForLoanAsync(int userId, string loanType, decimal loanAmount, int loanTermMonths, string? purpose)
    {
        // Calculate interest rate based on loan type (simple logic)
        var interestRate = CalculateInterestRate(loanType, loanAmount);

        // Calculate monthly payment using standard loan formula
        var monthlyPayment = CalculateMonthlyPayment(loanAmount, interestRate, loanTermMonths);

        var loan = new Loan
        {
            UserId = userId,
            LoanType = loanType,
            Amount = loanAmount,
            InterestRate = interestRate,
            TermMonths = loanTermMonths,
            MonthlyPayment = monthlyPayment,
            OutstandingBalance = loanAmount,
            Status = LoanStatus.Pending,
            ApplicationDate = DateTime.UtcNow,
            LoanPurpose = purpose,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();

        // Audit log
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "ApplyLoan",
            EntityType = "Loan",
            EntityId = loan.Id,
            Details = $"Loan application: {loanType} for {loanAmount:C}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Loan application submitted for user {UserId}: {LoanId}", userId, loan.Id);

        return MapToLoanDto(loan);
    }

    public async Task<LoanDto?> UpdateLoanStatusAsync(int loanId, int userId, LoanStatus newStatus)
    {
        var loan = await _context.Loans
            .FirstOrDefaultAsync(l => l.Id == loanId && l.UserId == userId);

        if (loan == null)
        {
            return null;
        }

        var oldStatus = loan.Status;
        loan.Status = newStatus;
        loan.UpdatedAt = DateTime.UtcNow;

        // Set approval/disbursement dates
        if (newStatus == LoanStatus.Approved && loan.ApprovalDate == null)
        {
            loan.ApprovalDate = DateTime.UtcNow;
        }
        else if (newStatus == LoanStatus.Active && loan.DisbursementDate == null)
        {
            loan.DisbursementDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // Audit log
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "UpdateLoanStatus",
            EntityType = "Loan",
            EntityId = loan.Id,
            Details = $"Loan status changed from {oldStatus} to {newStatus}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Loan {LoanId} status updated to {Status}", loanId, newStatus);

        return MapToLoanDto(loan);
    }

    public async Task<IEnumerable<LoanDto>> GetLoansByStatusAsync(int userId, LoanStatus status)
    {
        var loans = await _context.Loans
            .Where(l => l.UserId == userId && l.Status == status)
            .OrderByDescending(l => l.ApplicationDate)
            .ToListAsync();

        return loans.Select(MapToLoanDto);
    }

    private decimal CalculateInterestRate(string loanType, decimal amount)
    {
        // Simple interest rate calculation based on loan type
        return loanType.ToLower() switch
        {
            "personal" => 8.5m,
            "home" => 3.5m,
            "auto" => 5.0m,
            "education" => 4.0m,
            _ => 7.0m
        };
    }

    private decimal CalculateMonthlyPayment(decimal principal, decimal annualRate, int months)
    {
        if (months == 0) return 0;

        // Convert annual rate to monthly and percentage to decimal
        var monthlyRate = (annualRate / 100) / 12;

        if (monthlyRate == 0)
        {
            return principal / months;
        }

        // Standard loan payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
        var payment = principal * (monthlyRate * (decimal)Math.Pow((double)(1 + monthlyRate), months)) /
                      ((decimal)Math.Pow((double)(1 + monthlyRate), months) - 1);

        return Math.Round(payment, 2);
    }

    private LoanDto MapToLoanDto(Loan loan)
    {
        return new LoanDto
        {
            Id = loan.Id,
            UserId = loan.UserId,
            LoanType = loan.LoanType,
            LoanAmount = loan.Amount,
            InterestRate = loan.InterestRate,
            LoanTermMonths = loan.TermMonths,
            MonthlyPayment = loan.MonthlyPayment,
            OutstandingBalance = loan.OutstandingBalance,
            Status = loan.Status.ToString(),
            ApprovalDate = loan.ApprovalDate,
            DisbursementDate = loan.DisbursementDate,
            ApplicationDate = loan.ApplicationDate ?? DateTime.UtcNow,
            Purpose = loan.LoanPurpose
        };
    }
}
