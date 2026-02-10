using Microsoft.EntityFrameworkCore;
using BankingAPI.Models.Entities;

namespace BankingAPI.Data;

/// <summary>
/// Database context for the banking application.
/// Manages all database operations through Entity Framework Core.
/// </summary>
public class BankingDbContext : DbContext
{
    public BankingDbContext(DbContextOptions<BankingDbContext> options) : base(options)
    {
    }

    // DbSets - represent tables in the database
    public DbSet<User> Users { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<BudgetLimit> BudgetLimits { get; set; }
    public DbSet<Loan> Loans { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure default schema (matches our Docker init script)
        modelBuilder.HasDefaultSchema("banking");

        // ===== User Configuration =====
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(u => u.Email).IsUnique();  // Unique constraint for emails
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Name).HasMaxLength(255);
            entity.Property(u => u.Phone).HasMaxLength(50);
            
            // Relationships
            entity.HasMany(u => u.Accounts)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);  // Delete accounts when user is deleted
                
            entity.HasMany(u => u.BudgetLimits)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasMany(u => u.Loans)
                .WithOne(l => l.User)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== Account Configuration =====
        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("accounts");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.AccountName).IsRequired().HasMaxLength(255);
            entity.Property(a => a.AccountNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(a => a.AccountNumber).IsUnique();  // Unique account numbers
            entity.Property(a => a.ProductId).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Currency).IsRequired().HasMaxLength(3);  // ISO currency codes
            entity.Property(a => a.Balance).HasPrecision(18, 2);  // Precision for money
            
            // Index for faster queries by UserId
            entity.HasIndex(a => a.UserId);
            
            // Relationships
            entity.HasMany(a => a.Transactions)
                .WithOne(t => t.Account)
                .HasForeignKey(t => t.AccountId)
                .OnDelete(DeleteBehavior.Restrict);  // Don't delete transactions when account is deleted
        });

        // ===== Transaction Configuration =====
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("transactions");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Amount).HasPrecision(18, 2);
            entity.Property(t => t.Currency).IsRequired().HasMaxLength(3);
            entity.Property(t => t.Category).HasMaxLength(100);
            entity.Property(t => t.Description).HasMaxLength(500);
            
            // Indexes for common queries
            entity.HasIndex(t => t.AccountId);
            entity.HasIndex(t => t.TransactionTime);
            entity.HasIndex(t => new { t.AccountId, t.TransactionTime });  // Composite index
        });

        // ===== BudgetLimit Configuration =====
        modelBuilder.Entity<BudgetLimit>(entity =>
        {
            entity.ToTable("budget_limits");
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Category).IsRequired().HasMaxLength(100);
            entity.Property(b => b.MonthlyLimit).HasPrecision(18, 2);
            entity.Property(b => b.CurrentSpent).HasPrecision(18, 2);
            
            // Unique constraint: one budget limit per user per category
            entity.HasIndex(b => new { b.UserId, b.Category }).IsUnique();
        });

        // ===== Loan Configuration =====
        modelBuilder.Entity<Loan>(entity =>
        {
            entity.ToTable("loans");
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Amount).HasPrecision(18, 2);
            entity.Property(l => l.InterestRate).HasPrecision(5, 2);  // e.g., 5.75%
            entity.Property(l => l.MonthlyPayment).HasPrecision(18, 2);
            entity.Property(l => l.OutstandingBalance).HasPrecision(18, 2);
            
            // Index for queries by user and status
            entity.HasIndex(l => new { l.UserId, l.Status });
        });

        // ===== AuditLog Configuration =====
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Action).IsRequired().HasMaxLength(100);
            entity.Property(a => a.EntityType).IsRequired().HasMaxLength(100);
            entity.Property(a => a.IpAddress).HasMaxLength(45);  // IPv6 length
            
            // Indexes for audit queries
            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => a.Timestamp);
            entity.HasIndex(a => new { a.EntityType, a.EntityId });
            
            // Optional relationship (user can be null for system actions)
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);  // Keep audit logs even if user is deleted
        });
    }
}
