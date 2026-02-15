using Microsoft.EntityFrameworkCore;
using BankingAPI.Data;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Transaction management service
/// Handles transaction creation with automatic balance updates
/// </summary>
public class TransactionService : ITransactionService
{
    private readonly BankingDbContext _context;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(BankingDbContext context, ILogger<TransactionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all transactions for a specific account
    /// </summary>
    public async Task<IEnumerable<TransactionDto>> GetAccountTransactionsAsync(int accountId, int userId)
    {
        // Verify account belongs to user
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        if (account == null)
        {
            return Enumerable.Empty<TransactionDto>();
        }

        var transactions = await _context.Transactions
            .Where(t => t.AccountId == accountId)
            .OrderByDescending(t => t.TransactionTime)
            .Take(100) // Limit to last 100 transactions
            .ToListAsync();

        return transactions.Select(MapToTransactionDto);
    }

    /// <summary>
    /// Get recent transactions for all user accounts
    /// </summary>
    public async Task<IEnumerable<TransactionDto>> GetUserTransactionsAsync(int userId, int limit = 50)
    {
        var userAccountIds = await _context.Accounts
            .Where(a => a.UserId == userId)
            .Select(a => a.Id)
            .ToListAsync();

        var transactions = await _context.Transactions
            .Where(t => userAccountIds.Contains(t.AccountId))
            .OrderByDescending(t => t.TransactionTime)
            .Take(limit)
            .ToListAsync();

        return transactions.Select(MapToTransactionDto);
    }

    /// <summary>
    /// Get a specific transaction by ID
    /// </summary>
    public async Task<TransactionDto?> GetTransactionByIdAsync(int transactionId, int userId)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == transactionId && t.Account.UserId == userId);

        return transaction != null ? MapToTransactionDto(transaction) : null;
    }

    /// <summary>
    /// Create a new transaction and update account balance
    /// Uses database transaction to ensure consistency
    /// </summary>
    public async Task<TransactionDto?> CreateTransactionAsync(
        int accountId,
        int userId,
        TransactionType type,
        decimal amount,
        string? category,
        string? description)
    {
        // Use database transaction for atomicity
        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Verify account belongs to user and is active
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

            if (account == null || account.Status != AccountStatus.Active)
            {
                _logger.LogWarning("Transaction failed: Invalid account {AccountId} for user {UserId}", accountId, userId);
                return null;
            }

            // Check if debit transaction would cause negative balance
            if (type == TransactionType.Debit && account.Balance < amount)
            {
                _logger.LogWarning("Transaction failed: Insufficient funds in account {AccountId}", accountId);
                return null;
            }

            // Create transaction
            var transaction = new Transaction
            {
                AccountId = accountId,
                TransactionType = type,
                Amount = amount,
                Currency = account.Currency,
                Category = category,
                Description = description,
                TransactionTime = DateTime.UtcNow,
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);

            // Update account balance
            if (type == TransactionType.Credit)
            {
                account.Balance += amount;
            }
            else // Debit
            {
                account.Balance -= amount;
            }

            account.UpdatedAt = DateTime.UtcNow;

            // Save changes
            await _context.SaveChangesAsync();

            // Audit log
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = "CreateTransaction",
                EntityType = "Transaction",
                EntityId = transaction.Id,
                Details = $"{type} transaction of {amount:C} on account {account.AccountName}",
                Timestamp = DateTime.UtcNow
            };
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            //Commit transaction
            await dbTransaction.CommitAsync();

            _logger.LogInformation(
                "Transaction created: {TransactionId}, Type: {Type}, Amount: {Amount}, Account: {AccountId}",
                transaction.Id, type, amount, accountId);

            return MapToTransactionDto(transaction);
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            _logger.LogError(ex, "Error creating transaction for account {AccountId}", accountId);
            return null;
        }
    }

    /// <summary>
    /// Get transactions filtered by category
    /// </summary>
    public async Task<IEnumerable<TransactionDto>> GetTransactionsByCategoryAsync(int userId, string category)
    {
        var userAccountIds = await _context.Accounts
            .Where(a => a.UserId == userId)
            .Select(a => a.Id)
            .ToListAsync();

        var transactions = await _context.Transactions
            .Where(t => userAccountIds.Contains(t.AccountId) && t.Category == category)
            .OrderByDescending(t => t.TransactionTime)
            .Take(100)
            .ToListAsync();

        return transactions.Select(MapToTransactionDto);
    }

    /// <summary>
    /// Map Transaction entity to TransactionDto
    /// </summary>
    private TransactionDto MapToTransactionDto(Transaction transaction)
    {
        return new TransactionDto
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            TransactionType = transaction.TransactionType.ToString(),
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            Category = transaction.Category,
            Description = transaction.Description,
            TransactionTime = transaction.TransactionTime,
            Status = transaction.Status.ToString()
        };
    }
}
