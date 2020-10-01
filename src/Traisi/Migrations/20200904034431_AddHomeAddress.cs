using Microsoft.EntityFrameworkCore.Migrations;
using Traisi.Sdk.Interfaces;

namespace Traisi.Migrations
{
    public partial class AddHomeAddress : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Address>(
                name: "HomeAddress",
                table: "SurveyRespondents",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HomeAddress",
                table: "SurveyRespondents");
        }
    }
}
