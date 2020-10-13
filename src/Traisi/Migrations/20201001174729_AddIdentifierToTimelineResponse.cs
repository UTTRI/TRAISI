using Microsoft.EntityFrameworkCore.Migrations;

namespace Traisi.Migrations
{
    public partial class AddIdentifierToTimelineResponse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Identifier",
                table: "SurveyResponseValues",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Identifier",
                table: "SurveyResponseValues");
        }
    }
}
