using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Traisi.Migrations
{
    public partial class AddSurveyDataTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SurveyDataTables",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ColumnNames = table.Column<List<string>>(nullable: true),
                    RowNames = table.Column<List<string>>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    SurveyId = table.Column<int>(nullable: true),
                    SurveyId1 = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyDataTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyDataTables_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SurveyDataTables_Surveys_SurveyId1",
                        column: x => x.SurveyId1,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyDataTables_SurveyId",
                table: "SurveyDataTables",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyDataTables_SurveyId1",
                table: "SurveyDataTables",
                column: "SurveyId1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SurveyDataTables");
        }
    }
}
