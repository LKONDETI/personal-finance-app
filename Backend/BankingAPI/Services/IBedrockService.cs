using BankingAPI.Models.DTOs;

namespace BankingAPI.Services;

/// <summary>
/// Calls Amazon Bedrock's Converse API with a structured financial context
/// and returns the model's answer.
/// </summary>
public interface IBedrockService
{
    /// <summary>
    /// Sends the user's question and their pre-aggregated financial context
    /// to the configured Bedrock model and returns the response text.
    /// When AiAdvisor:MockMode is true, returns a canned response with zero AWS cost.
    /// </summary>
    Task<string> AskAsync(string userQuestion, FinancialContext context);
}
