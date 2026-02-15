using BankingAPI.Models.DTOs;

namespace BankingAPI.Services;

/// <summary>
/// Interface for account management service
/// </summary>
public interface IAccountService
{
    Task<IEnumerable<AccountDto>> GetUserAccountsAsync(int userId);
    Task<AccountDto?> GetAccountByIdAsync(int accountId, int userId);
    Task<AccountDto?> CreateAccountAsync(int userId, string accountName, string productId);
    Task<AccountDto?> UpdateAccountAsync(int accountId, int userId, string accountName);
    Task<bool> DeleteAccountAsync(int accountId, int userId);
    Task<decimal> GetAccountBalanceAsync(int accountId, int userId);
}
