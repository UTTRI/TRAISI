using Microsoft.EntityFrameworkCore.Migrations;

namespace Traisi.Migrations
{
    public partial class AddSurveyRejectedFlag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SurveyRejected",
                table: "Shortcodes",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SurveyRejected",
                table: "Shortcodes");
        }
    }
}
