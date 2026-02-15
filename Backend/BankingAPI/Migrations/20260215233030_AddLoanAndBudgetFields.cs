using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankingAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanAndBudgetFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CurrentSpent",
                schema: "banking",
                table: "budget_limits",
                newName: "CurrentSpending");

            migrationBuilder.AddColumn<string>(
                name: "LoanPurpose",
                schema: "banking",
                table: "loans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LoanType",
                schema: "banking",
                table: "loans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Month",
                schema: "banking",
                table: "budget_limits",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                schema: "banking",
                table: "budget_limits",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoanPurpose",
                schema: "banking",
                table: "loans");

            migrationBuilder.DropColumn(
                name: "LoanType",
                schema: "banking",
                table: "loans");

            migrationBuilder.DropColumn(
                name: "Month",
                schema: "banking",
                table: "budget_limits");

            migrationBuilder.DropColumn(
                name: "Year",
                schema: "banking",
                table: "budget_limits");

            migrationBuilder.RenameColumn(
                name: "CurrentSpending",
                schema: "banking",
                table: "budget_limits",
                newName: "CurrentSpent");
        }
    }
}
