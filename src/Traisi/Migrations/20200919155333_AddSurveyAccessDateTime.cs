using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Traisi.Migrations
{
    public partial class AddSurveyAccessDateTime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SurveyAccessDateTime",
                table: "SurveyRespondents",
                nullable: true,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, -5, 0, 0, 0)));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SurveyAccessDateTime",
                table: "SurveyRespondents");
        }
    }
}
