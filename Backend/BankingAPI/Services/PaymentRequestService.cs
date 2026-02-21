using Microsoft.EntityFrameworkCore;
using BankingAPI.Data;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Service implementation for managing payment requests.
/// Handles pay-full, pay-partial, and decline operations with real transaction creation.
/// </summary>
public class PaymentRequestService : IPaymentRequestService
{
    private readonly BankingDbContext _context;
    private readonly ILogger<PaymentRequestService> _logger;

    public PaymentRequestService(BankingDbContext context, ILogger<PaymentRequestService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<PaymentRequest>> GetByUserIdAsync(int userId, PaymentRequestStatus? status = null)
    {
        var query = _context.PaymentRequests
            .Where(pr => pr.UserId == userId);

        if (status.HasValue)
        {
            query = query.Where(pr => pr.Status == status.Value);
        }

        return await query
            .OrderByDescending(pr => pr.DueDate)
            .ToListAsync();
    }

    public async Task<PaymentRequest?> GetByIdAsync(int id, int userId)
    {
        return await _context.PaymentRequests
            .Include(pr => pr.Account)
            .FirstOrDefaultAsync(pr => pr.Id == id && pr.UserId == userId);
    }

    public async Task<PaymentRequest> PayFullAsync(int id, int userId, int accountId)
    {
        var request = await GetByIdAsync(id, userId)
            ?? throw new InvalidOperationException("Payment request not found");

        if (request.Status == PaymentRequestStatus.Paid)
            throw new InvalidOperationException("This request has already been paid");

        if (request.Status == PaymentRequestStatus.Declined)
            throw new InvalidOperationException("This request has been declined");

        var remainingAmount = request.Amount - request.AmountPaid;

        // Verify account belongs to user and has sufficient balance
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId)
            ?? throw new InvalidOperationException("Account not found");

        if (account.Balance < remainingAmount)
            throw new InvalidOperationException("Insufficient balance");

        // Create debit transaction
        var transaction = new Transaction
        {
            AccountId = accountId,
            TransactionType = TransactionType.Debit,
            Amount = remainingAmount,
            Currency = account.Currency,
            Category = "Bills & Payments",
            Description = $"Payment to {request.PayeeName} - {request.PayeeCategory}",
            TransactionTime = DateTime.UtcNow,
            Status = TransactionStatus.Completed
        };
        _context.Transactions.Add(transaction);

        // Update account balance
        account.Balance -= remainingAmount;
        account.UpdatedAt = DateTime.UtcNow;

        // Update payment request
        request.AmountPaid = request.Amount;
        request.AccountId = accountId;
        request.PaidDate = DateTime.UtcNow;
        request.Status = PaymentRequestStatus.Paid;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Payment request {Id} paid in full (${Amount}) by user {UserId} from account {AccountId}",
            id, remainingAmount, userId, accountId);

        return request;
    }

    public async Task<PaymentRequest> PayPartialAsync(int id, int userId, int accountId, decimal amount)
    {
        var request = await GetByIdAsync(id, userId)
            ?? throw new InvalidOperationException("Payment request not found");

        if (request.Status == PaymentRequestStatus.Paid)
            throw new InvalidOperationException("This request has already been paid");

        if (request.Status == PaymentRequestStatus.Declined)
            throw new InvalidOperationException("This request has been declined");

        var remainingAmount = request.Amount - request.AmountPaid;
        if (amount <= 0 || amount > remainingAmount)
            throw new InvalidOperationException($"Amount must be between $0.01 and ${remainingAmount}");

        // Verify account belongs to user and has sufficient balance
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId)
            ?? throw new InvalidOperationException("Account not found");

        if (account.Balance < amount)
            throw new InvalidOperationException("Insufficient balance");

        // Create debit transaction
        var transaction = new Transaction
        {
            AccountId = accountId,
            TransactionType = TransactionType.Debit,
            Amount = amount,
            Currency = account.Currency,
            Category = "Bills & Payments",
            Description = $"Partial payment to {request.PayeeName} - {request.PayeeCategory}",
            TransactionTime = DateTime.UtcNow,
            Status = TransactionStatus.Completed
        };
        _context.Transactions.Add(transaction);

        // Update account balance
        account.Balance -= amount;
        account.UpdatedAt = DateTime.UtcNow;

        // Update payment request
        request.AmountPaid += amount;
        request.AccountId = accountId;
        request.UpdatedAt = DateTime.UtcNow;

        // Check if fully paid now
        if (request.AmountPaid >= request.Amount)
        {
            request.Status = PaymentRequestStatus.Paid;
            request.PaidDate = DateTime.UtcNow;
        }
        else
        {
            request.Status = PaymentRequestStatus.PartiallyPaid;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Payment request {Id} partial payment (${Amount}) by user {UserId} from account {AccountId}",
            id, amount, userId, accountId);

        return request;
    }

    public async Task<PaymentRequest> DeclineAsync(int id, int userId)
    {
        var request = await GetByIdAsync(id, userId)
            ?? throw new InvalidOperationException("Payment request not found");

        if (request.Status == PaymentRequestStatus.Paid)
            throw new InvalidOperationException("Cannot decline a paid request");

        request.Status = PaymentRequestStatus.Declined;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Payment request {Id} declined by user {UserId}", id, userId);

        return request;
    }
}
