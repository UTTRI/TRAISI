using Microsoft.EntityFrameworkCore.Migrations;

namespace Traisi.Migrations
{
    public partial class AddMetaColumnToTimelineResponse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Meta",
                table: "SurveyResponseValues",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Meta",
                table: "SurveyResponseValues");
        }
    }
}
