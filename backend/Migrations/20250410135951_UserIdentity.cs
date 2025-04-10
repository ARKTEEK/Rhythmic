using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UserIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "4ee2cbc9-68bc-4169-b6a8-f345ce24b67c");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "805a2793-3fab-49e4-9bf8-e70921639ed7");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "04e03cd6-6d7d-4ef5-b85b-ab7d9803c294", null, "User", "USER" },
                    { "e53d59cf-245e-4fad-b36a-a3bbd7b9e717", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "04e03cd6-6d7d-4ef5-b85b-ab7d9803c294");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e53d59cf-245e-4fad-b36a-a3bbd7b9e717");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "4ee2cbc9-68bc-4169-b6a8-f345ce24b67c", null, "User", "USER" },
                    { "805a2793-3fab-49e4-9bf8-e70921639ed7", null, "Admin", "ADMIN" }
                });
        }
    }
}
