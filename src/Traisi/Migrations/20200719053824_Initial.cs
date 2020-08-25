using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Traisi.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Name = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Level = table.Column<int>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    UpdatedBy = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictApplications",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    ClientId = table.Column<string>(maxLength: 100, nullable: false),
                    ClientSecret = table.Column<string>(nullable: true),
                    ConcurrencyToken = table.Column<string>(maxLength: 50, nullable: true),
                    ConsentType = table.Column<string>(nullable: true),
                    DisplayName = table.Column<string>(nullable: true),
                    Permissions = table.Column<string>(nullable: true),
                    PostLogoutRedirectUris = table.Column<string>(nullable: true),
                    Properties = table.Column<string>(nullable: true),
                    RedirectUris = table.Column<string>(nullable: true),
                    Type = table.Column<string>(maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictScopes",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    ConcurrencyToken = table.Column<string>(maxLength: 50, nullable: true),
                    Description = table.Column<string>(nullable: true),
                    DisplayName = table.Column<string>(nullable: true),
                    Name = table.Column<string>(maxLength: 200, nullable: false),
                    Properties = table.Column<string>(nullable: true),
                    Resources = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictScopes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SiteSurveyTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    HTML = table.Column<string>(nullable: true),
                    CSS = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteSurveyTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Surveys",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    Code = table.Column<string>(maxLength: 30, nullable: false),
                    Name = table.Column<string>(maxLength: 100, nullable: false),
                    Owner = table.Column<string>(nullable: true),
                    Group = table.Column<string>(nullable: true),
                    StartAt = table.Column<DateTime>(nullable: false),
                    EndAt = table.Column<DateTime>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    IsOpen = table.Column<bool>(nullable: false),
                    SuccessLink = table.Column<string>(nullable: true),
                    RejectionLink = table.Column<string>(nullable: true),
                    DefaultLanguage = table.Column<string>(nullable: true),
                    StyleTemplate = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surveys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserGroups",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    Name = table.Column<string>(maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictAuthorizations",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    ApplicationId = table.Column<string>(nullable: true),
                    ConcurrencyToken = table.Column<string>(maxLength: 50, nullable: true),
                    Properties = table.Column<string>(nullable: true),
                    Scopes = table.Column<string>(nullable: true),
                    Status = table.Column<string>(maxLength: 25, nullable: false),
                    Subject = table.Column<string>(maxLength: 450, nullable: false),
                    Type = table.Column<string>(maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictAuthorizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpenIddictAuthorizations_OpenIddictApplications_Application~",
                        column: x => x.ApplicationId,
                        principalTable: "OpenIddictApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExtensionConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SurveyId = table.Column<int>(nullable: true),
                    ExtensionName = table.Column<string>(nullable: false),
                    Configuration = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtensionConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExtensionConfigurations_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Groupcodes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SurveyId = table.Column<int>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    Code = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    IsTest = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groupcodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Groupcodes_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionParts",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionType = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    IsGroupQuestion = table.Column<bool>(nullable: false),
                    SurveyId = table.Column<int>(nullable: true),
                    QuestionPartId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionParts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionParts_QuestionParts_QuestionPartId",
                        column: x => x.QuestionPartId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_QuestionParts_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SurveyViews",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SurveyId = table.Column<int>(nullable: false),
                    ViewName = table.Column<string>(maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyViews_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApiKeys",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    GroupId = table.Column<int>(nullable: false),
                    MapBoxApiKey = table.Column<string>(nullable: true),
                    GoogleMapsApiKey = table.Column<string>(nullable: true),
                    MailgunApiKey = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiKeys_UserGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "UserGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    HTML = table.Column<string>(nullable: true),
                    GroupId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailTemplates_UserGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "UserGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpenIddictTokens",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    ApplicationId = table.Column<string>(nullable: true),
                    AuthorizationId = table.Column<string>(nullable: true),
                    ConcurrencyToken = table.Column<string>(maxLength: 50, nullable: true),
                    CreationDate = table.Column<DateTimeOffset>(nullable: true),
                    ExpirationDate = table.Column<DateTimeOffset>(nullable: true),
                    Payload = table.Column<string>(nullable: true),
                    Properties = table.Column<string>(nullable: true),
                    ReferenceId = table.Column<string>(maxLength: 100, nullable: true),
                    Status = table.Column<string>(maxLength: 25, nullable: false),
                    Subject = table.Column<string>(maxLength: 450, nullable: false),
                    Type = table.Column<string>(maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenIddictTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpenIddictTokens_OpenIddictApplications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "OpenIddictApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId",
                        column: x => x.AuthorizationId,
                        principalTable: "OpenIddictAuthorizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Shortcodes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SurveyId = table.Column<int>(nullable: true),
                    GroupcodeId = table.Column<int>(nullable: true),
                    Code = table.Column<string>(nullable: true),
                    IsTest = table.Column<bool>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    SurveyCompleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shortcodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shortcodes_Groupcodes_GroupcodeId",
                        column: x => x.GroupcodeId,
                        principalTable: "Groupcodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Shortcodes_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: true),
                    Value = table.Column<string>(nullable: true),
                    IsResourceOnly = table.Column<bool>(nullable: false),
                    ValueType = table.Column<int>(nullable: false),
                    IsSourceInputRequired = table.Column<bool>(nullable: false),
                    QuestionPartId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionConfigurations_QuestionParts_QuestionPartId",
                        column: x => x.QuestionPartId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionOptions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: true),
                    Code = table.Column<string>(nullable: true),
                    Order = table.Column<int>(nullable: false),
                    QuestionPartParentId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionOptions_QuestionParts_QuestionPartParentId",
                        column: x => x.QuestionPartParentId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyLogic",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Condition = table.Column<int>(nullable: true),
                    Value = table.Column<string>(nullable: true),
                    ValidationQuestionId = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    RootId = table.Column<int>(nullable: true),
                    QuestionId = table.Column<int>(nullable: true),
                    Operator = table.Column<int>(nullable: true),
                    LogicType = table.Column<int>(nullable: true),
                    QuestionPartId = table.Column<int>(nullable: true),
                    SurveyId = table.Column<int>(nullable: true),
                    SurveyLogicId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyLogic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_SurveyLogic_ParentId",
                        column: x => x.ParentId,
                        principalTable: "SurveyLogic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_QuestionParts_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_QuestionParts_QuestionPartId",
                        column: x => x.QuestionPartId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_SurveyLogic_RootId",
                        column: x => x.RootId,
                        principalTable: "SurveyLogic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_SurveyLogic_SurveyLogicId",
                        column: x => x.SurveyLogicId,
                        principalTable: "SurveyLogic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurveyLogic_QuestionParts_ValidationQuestionId",
                        column: x => x.ValidationQuestionId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionPartViews",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionPartId = table.Column<int>(nullable: true),
                    ParentViewId = table.Column<int>(nullable: true),
                    SurveyViewId = table.Column<int>(nullable: true),
                    Order = table.Column<int>(nullable: false),
                    IsOptional = table.Column<bool>(nullable: false),
                    IsHousehold = table.Column<bool>(nullable: false),
                    IsMultiView = table.Column<bool>(nullable: false),
                    IsDefaultHidden = table.Column<bool>(nullable: false),
                    RepeatSourceId = table.Column<int>(nullable: true),
                    Icon = table.Column<string>(nullable: true),
                    CATIDependentId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionPartViews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionPartViews_QuestionPartViews_CATIDependentId",
                        column: x => x.CATIDependentId,
                        principalTable: "QuestionPartViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_QuestionPartViews_QuestionPartViews_ParentViewId",
                        column: x => x.ParentViewId,
                        principalTable: "QuestionPartViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionPartViews_QuestionParts_QuestionPartId",
                        column: x => x.QuestionPartId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_QuestionPartViews_QuestionParts_RepeatSourceId",
                        column: x => x.RepeatSourceId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_QuestionPartViews_SurveyViews_SurveyViewId",
                        column: x => x.SurveyViewId,
                        principalTable: "SurveyViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionOptionConditionals",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TargetOptionId = table.Column<int>(nullable: false),
                    SourceQuestionId = table.Column<int>(nullable: false),
                    Condition = table.Column<int>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionOptionConditionals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionOptionConditionals_QuestionParts_SourceQuestionId",
                        column: x => x.SourceQuestionId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionOptionConditionals_QuestionOptions_TargetOptionId",
                        column: x => x.TargetOptionId,
                        principalTable: "QuestionOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Labels",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Value = table.Column<string>(nullable: true),
                    Language = table.Column<string>(nullable: true),
                    QuestionConfigurationId = table.Column<int>(nullable: true),
                    QuestionOptionId = table.Column<int>(nullable: true),
                    QuestionPartViewDescriptionId = table.Column<int>(nullable: true),
                    QuestionPartViewId = table.Column<int>(nullable: true),
                    SurveyId = table.Column<int>(nullable: true),
                    SurveyLogicId = table.Column<int>(nullable: true),
                    SurveyViewScreeningId = table.Column<int>(nullable: true),
                    SurveyViewTermsId = table.Column<int>(nullable: true),
                    SurveyViewThankYouId = table.Column<int>(nullable: true),
                    SurveyViewWelcomePageId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Labels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Labels_QuestionConfigurations_QuestionConfigurationId",
                        column: x => x.QuestionConfigurationId,
                        principalTable: "QuestionConfigurations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Labels_QuestionOptions_QuestionOptionId",
                        column: x => x.QuestionOptionId,
                        principalTable: "QuestionOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_QuestionPartViews_QuestionPartViewDescriptionId",
                        column: x => x.QuestionPartViewDescriptionId,
                        principalTable: "QuestionPartViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_QuestionPartViews_QuestionPartViewId",
                        column: x => x.QuestionPartViewId,
                        principalTable: "QuestionPartViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_SurveyLogic_SurveyLogicId",
                        column: x => x.SurveyLogicId,
                        principalTable: "SurveyLogic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_SurveyViews_SurveyViewScreeningId",
                        column: x => x.SurveyViewScreeningId,
                        principalTable: "SurveyViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_SurveyViews_SurveyViewTermsId",
                        column: x => x.SurveyViewTermsId,
                        principalTable: "SurveyViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_SurveyViews_SurveyViewThankYouId",
                        column: x => x.SurveyViewThankYouId,
                        principalTable: "SurveyViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labels_SurveyViews_SurveyViewWelcomePageId",
                        column: x => x.SurveyViewWelcomePageId,
                        principalTable: "SurveyViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionConditionals",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SourceQuestionId = table.Column<int>(nullable: false),
                    Condition = table.Column<int>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionConditionals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionConditionals_QuestionPartViews_SourceQuestionId",
                        column: x => x.SourceQuestionId,
                        principalTable: "QuestionPartViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionCondtionalOperators",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Order = table.Column<int>(nullable: false),
                    OperatorType = table.Column<int>(nullable: false),
                    TargetQuestionId = table.Column<int>(nullable: false),
                    LhsId = table.Column<int>(nullable: true),
                    RhsId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionCondtionalOperators", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionCondtionalOperators_QuestionConditionals_LhsId",
                        column: x => x.LhsId,
                        principalTable: "QuestionConditionals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionCondtionalOperators_QuestionConditionals_RhsId",
                        column: x => x.RhsId,
                        principalTable: "QuestionConditionals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionCondtionalOperators_QuestionPartViews_TargetQuestio~",
                        column: x => x.TargetQuestionId,
                        principalTable: "QuestionPartViews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    RoleId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(nullable: false),
                    ProviderKey = table.Column<string>(nullable: false),
                    ProviderDisplayName = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    LoginProvider = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                });

            migrationBuilder.CreateTable(
                name: "GroupMembers",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserName = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: true),
                    Group = table.Column<string>(nullable: true),
                    UserGroupId = table.Column<int>(nullable: true),
                    DateJoined = table.Column<DateTime>(nullable: false),
                    GroupAdmin = table.Column<bool>(nullable: false),
                    TraisiUserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMembers_UserGroups_UserGroupId",
                        column: x => x.UserGroupId,
                        principalTable: "UserGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SurveyAccessRecords",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QueryParams = table.Column<string>(type: "jsonb", nullable: true),
                    AccessDateTime = table.Column<DateTimeOffset>(nullable: false),
                    UserAgent = table.Column<string>(nullable: true),
                    RemoteIpAddress = table.Column<string>(nullable: true),
                    RequestUrl = table.Column<string>(nullable: true),
                    RespondentId = table.Column<int>(nullable: true),
                    AccessUserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyAccessRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SurveyPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(nullable: true),
                    SurveyId = table.Column<int>(nullable: false),
                    PermissionCode = table.Column<string>(nullable: true),
                    TraisiUserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyPermissions_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyRespondents",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(nullable: true),
                    Relationship = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    PhoneNumber = table.Column<string>(nullable: true),
                    HasConsent = table.Column<bool>(nullable: false),
                    SurveyRespondentGroupId = table.Column<int>(nullable: true),
                    RespondentType = table.Column<int>(nullable: false),
                    ShortcodeId = table.Column<int>(nullable: true),
                    GroupcodeId = table.Column<int>(nullable: true),
                    UserId = table.Column<string>(nullable: true),
                    SurveyId = table.Column<int>(nullable: true),
                    PrimaryRespondentId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyRespondents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyRespondents_Groupcodes_GroupcodeId",
                        column: x => x.GroupcodeId,
                        principalTable: "Groupcodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SurveyRespondents_Shortcodes_ShortcodeId",
                        column: x => x.ShortcodeId,
                        principalTable: "Shortcodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SurveyRespondents_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SurveyRespondents_SurveyRespondents_PrimaryRespondentId",
                        column: x => x.PrimaryRespondentId,
                        principalTable: "SurveyRespondents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    UserName = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(maxLength: 256, nullable: true),
                    Email = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(nullable: false),
                    PasswordHash = table.Column<string>(nullable: true),
                    SecurityStamp = table.Column<string>(nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    PhoneNumber = table.Column<string>(nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(nullable: false),
                    TwoFactorEnabled = table.Column<bool>(nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(nullable: true),
                    LockoutEnabled = table.Column<bool>(nullable: false),
                    AccessFailedCount = table.Column<int>(nullable: false),
                    JobTitle = table.Column<string>(nullable: true),
                    FullName = table.Column<string>(nullable: true),
                    Configuration = table.Column<string>(nullable: true),
                    IsEnabled = table.Column<bool>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    UpdatedBy = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    UserType = table.Column<int>(nullable: false),
                    ShortcodeId = table.Column<int>(nullable: true),
                    PrimaryRespondentId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_SurveyRespondents_PrimaryRespondentId",
                        column: x => x.PrimaryRespondentId,
                        principalTable: "SurveyRespondents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Shortcodes_ShortcodeId",
                        column: x => x.ShortcodeId,
                        principalTable: "Shortcodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurveyRespondentGroups",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupPrimaryRespondentId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyRespondentGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyRespondentGroups_SurveyRespondents_GroupPrimaryRespon~",
                        column: x => x.GroupPrimaryRespondentId,
                        principalTable: "SurveyRespondents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SurveyResponses",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 256, nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    QuestionPartId = table.Column<int>(nullable: true),
                    Repeat = table.Column<int>(nullable: false),
                    RespondentId = table.Column<int>(nullable: true),
                    SurveyAccessRecordId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_QuestionParts_QuestionPartId",
                        column: x => x.QuestionPartId,
                        principalTable: "QuestionParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_SurveyRespondents_RespondentId",
                        column: x => x.RespondentId,
                        principalTable: "SurveyRespondents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SurveyResponses_SurveyAccessRecords_SurveyAccessRecordId",
                        column: x => x.SurveyAccessRecordId,
                        principalTable: "SurveyAccessRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SurveyResponseValues",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SurveyResponseId = table.Column<int>(nullable: true),
                    ResponseType = table.Column<int>(nullable: false),
                    Value = table.Column<DateTimeOffset>(nullable: true),
                    JsonResponse_Value = table.Column<string>(type: "jsonb", nullable: true),
                    Location = table.Column<Point>(type: "geography", nullable: true),
                    Address = table.Column<string>(type: "jsonb", nullable: true),
                    Purpose = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    TimeA = table.Column<DateTimeOffset>(nullable: true),
                    TimeB = table.Column<DateTimeOffset>(nullable: true),
                    Order = table.Column<int>(nullable: true),
                    NumberResponse_Value = table.Column<double>(nullable: true),
                    OptionSelectResponse_Value = table.Column<string>(nullable: true),
                    Code = table.Column<string>(nullable: true),
                    StringResponse_Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyResponseValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyResponseValues_SurveyResponses_SurveyResponseId",
                        column: x => x.SurveyResponseId,
                        principalTable: "SurveyResponses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_GroupId",
                table: "ApiKeys",
                column: "GroupId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_PrimaryRespondentId",
                table: "AspNetUsers",
                column: "PrimaryRespondentId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ShortcodeId",
                table: "AspNetUsers",
                column: "ShortcodeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_GroupId",
                table: "EmailTemplates",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtensionConfigurations_SurveyId",
                table: "ExtensionConfigurations",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_Groupcodes_SurveyId",
                table: "Groupcodes",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_TraisiUserId",
                table: "GroupMembers",
                column: "TraisiUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_UserGroupId",
                table: "GroupMembers",
                column: "UserGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMembers_UserId",
                table: "GroupMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_QuestionConfigurationId",
                table: "Labels",
                column: "QuestionConfigurationId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_QuestionOptionId",
                table: "Labels",
                column: "QuestionOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_QuestionPartViewDescriptionId",
                table: "Labels",
                column: "QuestionPartViewDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_QuestionPartViewId",
                table: "Labels",
                column: "QuestionPartViewId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_SurveyId",
                table: "Labels",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_SurveyLogicId",
                table: "Labels",
                column: "SurveyLogicId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_SurveyViewScreeningId",
                table: "Labels",
                column: "SurveyViewScreeningId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_SurveyViewTermsId",
                table: "Labels",
                column: "SurveyViewTermsId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_SurveyViewThankYouId",
                table: "Labels",
                column: "SurveyViewThankYouId");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_SurveyViewWelcomePageId",
                table: "Labels",
                column: "SurveyViewWelcomePageId");

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictApplications_ClientId",
                table: "OpenIddictApplications",
                column: "ClientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictAuthorizations_ApplicationId_Status_Subject_Type",
                table: "OpenIddictAuthorizations",
                columns: new[] { "ApplicationId", "Status", "Subject", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictScopes_Name",
                table: "OpenIddictScopes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictTokens_AuthorizationId",
                table: "OpenIddictTokens",
                column: "AuthorizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictTokens_ReferenceId",
                table: "OpenIddictTokens",
                column: "ReferenceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpenIddictTokens_ApplicationId_Status_Subject_Type",
                table: "OpenIddictTokens",
                columns: new[] { "ApplicationId", "Status", "Subject", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_QuestionConditionals_SourceQuestionId",
                table: "QuestionConditionals",
                column: "SourceQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionCondtionalOperators_LhsId",
                table: "QuestionCondtionalOperators",
                column: "LhsId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionCondtionalOperators_RhsId",
                table: "QuestionCondtionalOperators",
                column: "RhsId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionCondtionalOperators_TargetQuestionId",
                table: "QuestionCondtionalOperators",
                column: "TargetQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionConfigurations_QuestionPartId",
                table: "QuestionConfigurations",
                column: "QuestionPartId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionOptionConditionals_SourceQuestionId",
                table: "QuestionOptionConditionals",
                column: "SourceQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionOptionConditionals_TargetOptionId",
                table: "QuestionOptionConditionals",
                column: "TargetOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionOptions_QuestionPartParentId",
                table: "QuestionOptions",
                column: "QuestionPartParentId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionOptions_Code_QuestionPartParentId",
                table: "QuestionOptions",
                columns: new[] { "Code", "QuestionPartParentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuestionParts_QuestionPartId",
                table: "QuestionParts",
                column: "QuestionPartId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionParts_SurveyId",
                table: "QuestionParts",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionPartViews_CATIDependentId",
                table: "QuestionPartViews",
                column: "CATIDependentId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionPartViews_ParentViewId",
                table: "QuestionPartViews",
                column: "ParentViewId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionPartViews_QuestionPartId",
                table: "QuestionPartViews",
                column: "QuestionPartId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionPartViews_RepeatSourceId",
                table: "QuestionPartViews",
                column: "RepeatSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionPartViews_SurveyViewId",
                table: "QuestionPartViews",
                column: "SurveyViewId");

            migrationBuilder.CreateIndex(
                name: "IX_Shortcodes_GroupcodeId",
                table: "Shortcodes",
                column: "GroupcodeId");

            migrationBuilder.CreateIndex(
                name: "IX_Shortcodes_SurveyId",
                table: "Shortcodes",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyAccessRecords_AccessUserId",
                table: "SurveyAccessRecords",
                column: "AccessUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyAccessRecords_RespondentId",
                table: "SurveyAccessRecords",
                column: "RespondentId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_ParentId",
                table: "SurveyLogic",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_QuestionId",
                table: "SurveyLogic",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_QuestionPartId",
                table: "SurveyLogic",
                column: "QuestionPartId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_RootId",
                table: "SurveyLogic",
                column: "RootId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_SurveyId",
                table: "SurveyLogic",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_SurveyLogicId",
                table: "SurveyLogic",
                column: "SurveyLogicId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyLogic_ValidationQuestionId",
                table: "SurveyLogic",
                column: "ValidationQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyPermissions_SurveyId",
                table: "SurveyPermissions",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyPermissions_TraisiUserId",
                table: "SurveyPermissions",
                column: "TraisiUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyPermissions_UserId",
                table: "SurveyPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondentGroups_GroupPrimaryRespondentId",
                table: "SurveyRespondentGroups",
                column: "GroupPrimaryRespondentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondents_GroupcodeId",
                table: "SurveyRespondents",
                column: "GroupcodeId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondents_ShortcodeId",
                table: "SurveyRespondents",
                column: "ShortcodeId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondents_SurveyId",
                table: "SurveyRespondents",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondents_UserId",
                table: "SurveyRespondents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondents_PrimaryRespondentId",
                table: "SurveyRespondents",
                column: "PrimaryRespondentId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyRespondents_SurveyRespondentGroupId",
                table: "SurveyRespondents",
                column: "SurveyRespondentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_QuestionPartId",
                table: "SurveyResponses",
                column: "QuestionPartId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_RespondentId",
                table: "SurveyResponses",
                column: "RespondentId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyAccessRecordId",
                table: "SurveyResponses",
                column: "SurveyAccessRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponseValues_SurveyResponseId",
                table: "SurveyResponseValues",
                column: "SurveyResponseId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyViews_SurveyId",
                table: "SurveyViews",
                column: "SurveyId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_Name",
                table: "UserGroups",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMembers_AspNetUsers_TraisiUserId",
                table: "GroupMembers",
                column: "TraisiUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMembers_AspNetUsers_UserId",
                table: "GroupMembers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyAccessRecords_AspNetUsers_AccessUserId",
                table: "SurveyAccessRecords",
                column: "AccessUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyAccessRecords_SurveyRespondents_RespondentId",
                table: "SurveyAccessRecords",
                column: "RespondentId",
                principalTable: "SurveyRespondents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyPermissions_AspNetUsers_TraisiUserId",
                table: "SurveyPermissions",
                column: "TraisiUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyPermissions_AspNetUsers_UserId",
                table: "SurveyPermissions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyRespondents_AspNetUsers_UserId",
                table: "SurveyRespondents",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyRespondents_SurveyRespondentGroups_SurveyRespondentGr~",
                table: "SurveyRespondents",
                column: "SurveyRespondentGroupId",
                principalTable: "SurveyRespondentGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SurveyRespondents_AspNetUsers_UserId",
                table: "SurveyRespondents");

            migrationBuilder.DropForeignKey(
                name: "FK_SurveyRespondentGroups_SurveyRespondents_GroupPrimaryRespon~",
                table: "SurveyRespondentGroups");

            migrationBuilder.DropTable(
                name: "ApiKeys");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "EmailTemplates");

            migrationBuilder.DropTable(
                name: "ExtensionConfigurations");

            migrationBuilder.DropTable(
                name: "GroupMembers");

            migrationBuilder.DropTable(
                name: "Labels");

            migrationBuilder.DropTable(
                name: "OpenIddictScopes");

            migrationBuilder.DropTable(
                name: "OpenIddictTokens");

            migrationBuilder.DropTable(
                name: "QuestionCondtionalOperators");

            migrationBuilder.DropTable(
                name: "QuestionOptionConditionals");

            migrationBuilder.DropTable(
                name: "SiteSurveyTemplates");

            migrationBuilder.DropTable(
                name: "SurveyPermissions");

            migrationBuilder.DropTable(
                name: "SurveyResponseValues");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "UserGroups");

            migrationBuilder.DropTable(
                name: "QuestionConfigurations");

            migrationBuilder.DropTable(
                name: "SurveyLogic");

            migrationBuilder.DropTable(
                name: "OpenIddictAuthorizations");

            migrationBuilder.DropTable(
                name: "QuestionConditionals");

            migrationBuilder.DropTable(
                name: "QuestionOptions");

            migrationBuilder.DropTable(
                name: "SurveyResponses");

            migrationBuilder.DropTable(
                name: "OpenIddictApplications");

            migrationBuilder.DropTable(
                name: "QuestionPartViews");

            migrationBuilder.DropTable(
                name: "SurveyAccessRecords");

            migrationBuilder.DropTable(
                name: "QuestionParts");

            migrationBuilder.DropTable(
                name: "SurveyViews");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "SurveyRespondents");

            migrationBuilder.DropTable(
                name: "Shortcodes");

            migrationBuilder.DropTable(
                name: "SurveyRespondentGroups");

            migrationBuilder.DropTable(
                name: "Groupcodes");

            migrationBuilder.DropTable(
                name: "Surveys");
        }
    }
}
