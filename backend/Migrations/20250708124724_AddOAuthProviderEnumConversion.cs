using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOAuthProviderEnumConversion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserConnections_UserId_Provider",
                table: "UserConnections");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "72a63e27-f176-4238-8f09-08efa6cfe6d3");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "becf04f0-be38-46f4-9a8c-7b11aa24afe2");

            migrationBuilder.AlterColumn<string>(
                name: "Provider",
                table: "UserConnections",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1269b12e-d2d0-46bc-813d-795c6e3b2918", null, "Admin", "ADMIN" },
                    { "f110587e-59fb-4b79-a7f6-1ad360e311ec", null, "User", "USER" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserConnections_UserId",
                table: "UserConnections",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserConnections_UserId",
                table: "UserConnections");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "1269b12e-d2d0-46bc-813d-795c6e3b2918");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "f110587e-59fb-4b79-a7f6-1ad360e311ec");

            migrationBuilder.AlterColumn<string>(
                name: "Provider",
                table: "UserConnections",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "72a63e27-f176-4238-8f09-08efa6cfe6d3", null, "Admin", "ADMIN" },
                    { "becf04f0-be38-46f4-9a8c-7b11aa24afe2", null, "User", "USER" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserConnections_UserId_Provider",
                table: "UserConnections",
                columns: new[] { "UserId", "Provider" },
                unique: true);
        }
    }
}
