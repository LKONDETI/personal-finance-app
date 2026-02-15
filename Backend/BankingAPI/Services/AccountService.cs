using Microsoft.EntityFrameworkCore;
using BankingAPI.Data;
using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Account management service for handling bank accounts
/// </summary>
public class AccountService : IAccountService
{
    private readonly BankingDbContext _context;
    private readonly ILogger<AccountService> _logger;

    public AccountService(BankingDbContext context, ILogger<AccountService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all accounts for a specific user
    /// </summary>
    public async Task<IEnumerable<AccountDto>> GetUserAccountsAsync(int userId)
    {
        var accounts = await _context.Accounts
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return accounts.Select(MapToAccountDto);
    }

    /// <summary>
    /// Get a specific account by ID (with user validation)
    /// </summary>
    public async Task<AccountDto?> GetAccountByIdAsync(int accountId, int userId)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        return account != null ? MapToAccountDto(account) : null;
    }

    /// <summary>
    /// Create a new account for a user
    /// </summary>
    public async Task<AccountDto?> CreateAccountAsync(int userId, string accountName, string productId)
    {
        // Generate unique account number (simple version - in production use better logic)
        var accountNumber = GenerateAccountNumber();

        var account = new Account
        {
            UserId = userId,
            AccountName = accountName,
            AccountNumber = accountNumber,
            ProductId = productId,
            Currency = "USD",
            Balance = 0,
            Status = AccountStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        // Log account creation in audit log
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "CreateAccount",
            EntityType = "Account",
            EntityId = account.Id,
            Details = $"New account created: {accountName} ({accountNumber})",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Account created for user {UserId}: {AccountId}", userId, account.Id);

        return MapToAccountDto(account);
    }

    /// <summary>
    /// Update account name
    /// </summary>
    public async Task<AccountDto?> UpdateAccountAsync(int accountId, int userId, string accountName)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        if (account == null)
        {
            return null;
        }

        account.AccountName = accountName;
        account.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log update
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "UpdateAccount",
            EntityType = "Account",
            EntityId = account.Id,
            Details = $"Account renamed to: {accountName}",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Account {AccountId} updated by user {UserId}", accountId, userId);

        return MapToAccountDto(account);
    }

    /// <summary>
    /// Delete (close) an account - only if balance is zero
    /// </summary>
    public async Task<bool> DeleteAccountAsync(int accountId, int userId)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        if (account == null)
        {
            return false;
        }

        // Check if balance is zero
        if (account.Balance != 0)
        {
            _logger.LogWarning("Cannot delete account {AccountId} with non-zero balance", accountId);
            return false;
        }

        // Soft delete - change status to Closed instead of actually deleting
        account.Status = AccountStatus.Closed;
        account.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log account closure
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = "CloseAccount",
            EntityType = "Account",
            EntityId = account.Id,
            Details = $"Account closed: {account.AccountName} ({account.AccountNumber})",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Account {AccountId} closed by user {UserId}", accountId, userId);

        return true;
    }

    /// <summary>
    /// Get current balance for an account
    /// </summary>
    public async Task<decimal> GetAccountBalanceAsync(int accountId, int userId)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        return account?.Balance ?? 0;
    }

    /// <summary>
    /// Generate a unique account number (simple implementation)
    /// In production, use a more sophisticated algorithm
    /// </summary>
    private string GenerateAccountNumber()
    {
        var timestamp = DateTime.UtcNow.Ticks;
        var random = new Random();
        return $"{timestamp % 10000000000:D10}{random.Next(1000, 9999)}";
    }

    /// <summary>
    /// Map Account entity to AccountDto
    /// </summary>
    private AccountDto MapToAccountDto(Account account)
    {
        return new AccountDto
        {
            Id = account.Id,
            AccountName = account.AccountName,
            AccountNumber = account.AccountNumber,
            ProductId = account.ProductId,
            Currency = account.Currency,
            Balance = account.Balance,
            Status = account.Status.ToString(),
            CreatedAt = account.CreatedAt
        };
    }
}
