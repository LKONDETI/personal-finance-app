using BankingAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BankingAPI.Data;

/// <summary>
/// Database seeder for populating initial test data
/// </summary>
public static class DatabaseSeeder
{
    public static async Task SeedDataAsync(BankingDbContext context)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            Console.WriteLine("Database already seeded.");
            return;
        }

        Console.WriteLine("Seeding database with test data...");

        // Create test users (passwords: "Test123!" for all)
        var users = new List<User>
        {
            new User
            {
                Email = "john.doe@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!", 12),
                Name = "John Doe",
                Phone = "+1234567890",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow.AddMonths(-6)
            },
            new User
            {
                Email = "jane.smith@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!", 12),
                Name = "Jane Smith",
                Phone = "+1234567891",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                UpdatedAt = DateTime.UtcNow.AddMonths(-3)
            },
            new User
            {
                Email = "demo@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!", 12),
                Name = "Demo User",
                Phone = "+1234567892",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow.AddDays(-30)
            }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Create accounts for users
        var accounts = new List<Account>
        {
            // John's accounts
            new Account
            {
                UserId = users[0].Id,
                AccountName = "Checking Account",
                AccountNumber = "1001234567890",
                ProductId = "CHECKING_001",
                Currency = "USD",
                Balance = 5250.75m,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow
            },
            new Account
            {
                UserId = users[0].Id,
                AccountName = "Savings Account",
                AccountNumber = "2001234567890",
                ProductId = "SAVINGS_001",
                Currency = "USD",
                Balance = 15000.00m,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow
            },
            // Jane's accounts
            new Account
            {
                UserId = users[1].Id,
                AccountName = "Personal Checking",
                AccountNumber = "1001234567891",
                ProductId = "CHECKING_001",
                Currency = "USD",
                Balance = 8750.50m,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                UpdatedAt = DateTime.UtcNow
            },
            new Account
            {
                UserId = users[1].Id,
                AccountName = "Emergency Fund",
                AccountNumber = "2001234567891",
                ProductId = "SAVINGS_001",
                Currency = "USD",
                Balance = 25000.00m,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                UpdatedAt = DateTime.UtcNow
            },
            // Demo user accounts
            new Account
            {
                UserId = users[2].Id,
                AccountName = "Main Account",
                AccountNumber = "1001234567892",
                ProductId = "CHECKING_001",
                Currency = "USD",
                Balance = 3420.25m,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Accounts.AddRange(accounts);
        await context.SaveChangesAsync();

        // Create transactions
        var transactions = new List<Transaction>
        {
            // John's transactions
            new Transaction
            {
                AccountId = accounts[0].Id,
                TransactionType = TransactionType.Credit,
                Amount = 3500.00m,
                Currency = "USD",
                Category = "Salary",
                Description = "Monthly salary deposit",
                TransactionTime = DateTime.UtcNow.AddDays(-25),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                UpdatedAt = DateTime.UtcNow.AddDays(-25)
            },
            new Transaction
            {
                AccountId = accounts[0].Id,
                TransactionType = TransactionType.Debit,
                Amount = 1250.00m,
                Currency = "USD",
                Category = "Rent",
                Description = "Monthly rent payment",
                TransactionTime = DateTime.UtcNow.AddDays(-20),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-20)
            },
            new Transaction
            {
                AccountId = accounts[0].Id,
                TransactionType = TransactionType.Debit,
                Amount = 85.50m,
                Currency = "USD",
                Category = "Groceries",
                Description = "Weekly grocery shopping",
                TransactionTime = DateTime.UtcNow.AddDays(-15),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                UpdatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Transaction
            {
                AccountId = accounts[0].Id,
                TransactionType = TransactionType.Debit,
                Amount = 45.25m,
                Currency = "USD",
                Category = "Utilities",
                Description = "Electric bill",
                TransactionTime = DateTime.UtcNow.AddDays(-10),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                UpdatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Transaction
            {
                AccountId = accounts[0].Id,
                TransactionType = TransactionType.Debit,
                Amount = 120.00m,
                Currency = "USD",
                Category = "Entertainment",
                Description = "Concert tickets",
                TransactionTime = DateTime.UtcNow.AddDays(-5),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            // Jane's transactions
            new Transaction
            {
                AccountId = accounts[2].Id,
                TransactionType = TransactionType.Credit,
                Amount = 5200.00m,
                Currency = "USD",
                Category = "Salary",
                Description = "Paycheck",
                TransactionTime = DateTime.UtcNow.AddDays(-22),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-22),
                UpdatedAt = DateTime.UtcNow.AddDays(-22)
            },
            new Transaction
            {
                AccountId = accounts[2].Id,
                TransactionType = TransactionType.Debit,
                Amount = 95.75m,
                Currency = "USD",
                Category = "Groceries",
                Description = "Supermarket",
                TransactionTime = DateTime.UtcNow.AddDays(-12),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-12),
                UpdatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new Transaction
            {
                AccountId = accounts[2].Id,
                TransactionType = TransactionType.Debit,
                Amount = 250.00m,
                Currency = "USD",
                Category = "Shopping",
                Description = "New laptop accessories",
                TransactionTime = DateTime.UtcNow.AddDays(-7),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                UpdatedAt = DateTime.UtcNow.AddDays(-7)
            },
            // Demo user transactions
            new Transaction
            {
                AccountId = accounts[4].Id,
                TransactionType = TransactionType.Credit,
                Amount = 2500.00m,
                Currency = "USD",
                Category = "Salary",
                Description = "Freelance payment",
                TransactionTime = DateTime.UtcNow.AddDays(-15),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                UpdatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Transaction
            {
                AccountId = accounts[4].Id,
                TransactionType = TransactionType.Debit,
                Amount = 75.50m,
                Currency = "USD",
                Category = "Groceries",
                Description = "Grocery store",
                TransactionTime = DateTime.UtcNow.AddDays(-8),
                Status = TransactionStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                UpdatedAt = DateTime.UtcNow.AddDays(-8)
            }
        };

        context.Transactions.AddRange(transactions);
        await context.SaveChangesAsync();

        // Create budget limits (current month)
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;
        
        var budgets = new List<BudgetLimit>
        {
            // John's budgets
            new BudgetLimit
            {
                UserId = users[0].Id,
                Category = "Groceries",
                MonthlyLimit = 500.00m,
                CurrentSpending = 85.50m,
                Month = currentMonth,
                Year = currentYear,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                UpdatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new BudgetLimit
            {
                UserId = users[0].Id,
                Category = "Entertainment",
                MonthlyLimit = 300.00m,
                CurrentSpending = 120.00m,
                Month = currentMonth,
                Year = currentYear,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new BudgetLimit
            {
                UserId = users[0].Id,
                Category = "Utilities",
                MonthlyLimit = 200.00m,
                CurrentSpending = 45.25m,
                Month = currentMonth,
                Year = currentYear,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                UpdatedAt = DateTime.UtcNow.AddDays(-10)
            },
            // Jane's budgets
            new BudgetLimit
            {
                UserId = users[1].Id,
                Category = "Groceries",
                MonthlyLimit = 600.00m,
                CurrentSpending = 95.75m,
                Month = currentMonth,
                Year = currentYear,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new BudgetLimit
            {
                UserId = users[1].Id,
                Category = "Shopping",
                MonthlyLimit = 800.00m,
                CurrentSpending = 250.00m,
                Month = currentMonth,
                Year = currentYear,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-7)
            },
            // Demo user budgets
            new BudgetLimit
            {
                UserId = users[2].Id,
                Category = "Groceries",
                MonthlyLimit = 400.00m,
                CurrentSpending = 75.50m,
                Month = currentMonth,
                Year = currentYear,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                UpdatedAt = DateTime.UtcNow.AddDays(-8)
            }
        };

        context.BudgetLimits.AddRange(budgets);
        await context.SaveChangesAsync();

        // Create loan applications
        var loans = new List<Loan>
        {
            // John's loans
            new Loan
            {
                UserId = users[0].Id,
                LoanType = "Personal",
                Amount = 10000.00m,
                InterestRate = 8.5m,
                TermMonths = 36,
                MonthlyPayment = 316.69m,
                OutstandingBalance = 10000.00m,
                LoanPurpose = "Home renovation",
                Status = LoanStatus.Approved,
                ApplicationDate = DateTime.UtcNow.AddMonths(-2),
                ApprovalDate = DateTime.UtcNow.AddMonths(-1).AddDays(-15),
                CreatedAt = DateTime.UtcNow.AddMonths(-2),
                UpdatedAt = DateTime.UtcNow.AddMonths(-1).AddDays(-15)
            },
            // Jane's loans
            new Loan
            {
                UserId = users[1].Id,
                LoanType = "Auto",
                Amount = 25000.00m,
                InterestRate = 5.0m,
                TermMonths = 60,
                MonthlyPayment = 471.78m,
                OutstandingBalance = 25000.00m,
                LoanPurpose = "New car purchase",
                Status = LoanStatus.Active,
                ApplicationDate = DateTime.UtcNow.AddMonths(-1),
                ApprovalDate = DateTime.UtcNow.AddDays(-20),
                DisbursementDate = DateTime.UtcNow.AddDays(-15),
                CreatedAt = DateTime.UtcNow.AddMonths(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Loan
            {
                UserId = users[1].Id,
                LoanType = "Education",
                Amount = 15000.00m,
                InterestRate = 4.0m,
                TermMonths = 120,
                MonthlyPayment = 151.79m,
                OutstandingBalance = 15000.00m,
                LoanPurpose = "MBA program",
                Status = LoanStatus.Pending,
                ApplicationDate = DateTime.UtcNow.AddDays(-5),
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            // Demo user loans
            new Loan
            {
                UserId = users[2].Id,
                LoanType = "Personal",
                Amount = 5000.00m,
                InterestRate = 8.5m,
                TermMonths = 24,
                MonthlyPayment = 226.45m,
                OutstandingBalance = 5000.00m,
                LoanPurpose = "Emergency expenses",
                Status = LoanStatus.Pending,
                ApplicationDate = DateTime.UtcNow.AddDays(-3),
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow.AddDays(-3)
            }
        };

        context.Loans.AddRange(loans);
        await context.SaveChangesAsync();

        Console.WriteLine($"✅ Seeded {users.Count} users");
        Console.WriteLine($"✅ Seeded {accounts.Count} accounts");
        Console.WriteLine($"✅ Seeded {transactions.Count} transactions");
        Console.WriteLine($"✅ Seeded {budgets.Count} budgets");
        Console.WriteLine($"✅ Seeded {loans.Count} loans");
        Console.WriteLine("Database seeding completed successfully!");
    }
}
