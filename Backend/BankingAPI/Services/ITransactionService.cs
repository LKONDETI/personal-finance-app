using BankingAPI.Models.DTOs;
using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Interface for transaction management service
/// </summary>
public interface ITransactionService
{
    Task<IEnumerable<TransactionDto>> GetAccountTransactionsAsync(int accountId, int userId);
    Task<IEnumerable<TransactionDto>> GetUserTransactionsAsync(int userId, int limit = 50);
    Task<TransactionDto?> GetTransactionByIdAsync(int transactionId, int userId);
    Task<TransactionDto?> CreateTransactionAsync(int accountId, int userId, TransactionType type, decimal amount, string? category, string? description);
    Task<IEnumerable<TransactionDto>> GetTransactionsByCategoryAsync(int userId, string category);
}
