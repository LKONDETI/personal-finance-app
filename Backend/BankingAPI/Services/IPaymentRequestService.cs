using BankingAPI.Models.Entities;

namespace BankingAPI.Services;

/// <summary>
/// Service interface for managing payment requests.
/// </summary>
public interface IPaymentRequestService
{
    /// <summary>Get all payment requests for a user, optionally filtered by status.</summary>
    Task<List<PaymentRequest>> GetByUserIdAsync(int userId, PaymentRequestStatus? status = null);
    
    /// <summary>Get a specific payment request by ID (must belong to user).</summary>
    Task<PaymentRequest?> GetByIdAsync(int id, int userId);
    
    /// <summary>Pay the full remaining amount. Creates a Debit transaction and updates account balance.</summary>
    Task<PaymentRequest> PayFullAsync(int id, int userId, int accountId);
    
    /// <summary>Pay a partial amount. Creates a Debit transaction for the specified amount.</summary>
    Task<PaymentRequest> PayPartialAsync(int id, int userId, int accountId, decimal amount);
    
    /// <summary>Decline a payment request. No money is moved.</summary>
    Task<PaymentRequest> DeclineAsync(int id, int userId);
}
