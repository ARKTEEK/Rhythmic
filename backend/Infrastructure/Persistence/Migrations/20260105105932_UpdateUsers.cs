using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "AspNetUsers",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "admin-default-user-id",
                columns: new[] { "ConcurrencyStamp", "CreatedAt", "PasswordHash", "SecurityStamp" },
                values: new object[] { "44dc068a-60c7-4917-b7ea-7c699824cbdf", new DateTime(2026, 1, 5, 10, 59, 31, 347, DateTimeKind.Utc).AddTicks(6611), "AQAAAAIAAYagAAAAEBLYcEB5BRw9eTFaGoBKCdONWNQOS5BysUq5tArIcstvVJWwXxfymaTcTf8LvrOYkQ==", "be4b0db7-bbb7-484d-89f7-37d8e7194d56" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "admin-default-user-id",
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "be4b0db7-bbb7-484d-89f7-37d8e7194d56", "AQAAAAIAAYagAAAAEAEN51NyA6SZ5hyW1jOEOzEdXfsv4nsMyNkM10zoYIQM2dWjSZS5Mo+mrb36nSjKZw==", "44dc068a-60c7-4917-b7ea-7c699824cbdf" });
        }
    }
}
