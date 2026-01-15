using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[] { "admin-default-user-id", 0, "be4b0db7-bbb7-484d-89f7-37d8e7194d56", "admin@rhythmic.local", true, false, null, "ADMIN@RHYTHMIC.LOCAL", "ADMIN", "AQAAAAIAAYagAAAAEAEN51NyA6SZ5hyW1jOEOzEdXfsv4nsMyNkM10zoYIQM2dWjSZS5Mo+mrb36nSjKZw==", null, false, "44dc068a-60c7-4917-b7ea-7c699824cbdf", false, "admin" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "288fd75c-0471-4c64-9d8e-af206019088e", "admin-default-user-id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "288fd75c-0471-4c64-9d8e-af206019088e", "admin-default-user-id" });

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "admin-default-user-id");
        }
    }
}
