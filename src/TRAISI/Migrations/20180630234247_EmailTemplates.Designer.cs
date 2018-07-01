﻿// <auto-generated />
using DAL;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Storage.Internal;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using System;

namespace TRAISI.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20180630234247_EmailTemplates")]
    partial class EmailTemplates
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn)
                .HasAnnotation("ProductVersion", "2.0.1-rtm-125");

            modelBuilder.Entity("DAL.Models.ApplicationRole", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDate");

                    b.Property<string>("Description");

                    b.Property<int>("Level");

                    b.Property<string>("Name")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256);

                    b.Property<string>("UpdatedBy");

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasName("RoleNameIndex");

                    b.ToTable("AspNetRoles");
                });

            modelBuilder.Entity("DAL.Models.ApplicationUser", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Configuration");

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDate");

                    b.Property<string>("Email")
                        .HasMaxLength(256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("FullName");

                    b.Property<bool>("IsEnabled");

                    b.Property<string>("JobTitle");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256);

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UpdatedBy");

                    b.Property<DateTime>("UpdatedDate");

                    b.Property<string>("UserName")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasName("UserNameIndex");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("DAL.Models.Groups.ApiKeys", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("CreatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("CreatedDate");

                    b.Property<string>("GoogleMapsApiKey");

                    b.Property<string>("MailgunApiKey");

                    b.Property<string>("MapBoxApiKey");

                    b.Property<string>("UpdatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("Id");

                    b.ToTable("ApiKeys");
                });

            modelBuilder.Entity("DAL.Models.Groups.EmailTemplate", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("CreatedDate");

                    b.Property<int?>("GroupId");

                    b.Property<string>("HTML");

                    b.Property<string>("Name");

                    b.Property<string>("UpdatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("Id");

                    b.HasIndex("GroupId");

                    b.ToTable("EmailTemplates");
                });

            modelBuilder.Entity("DAL.Models.Groups.GroupMember", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("DateJoined");

                    b.Property<string>("Group");

                    b.Property<bool>("GroupAdmin");

                    b.Property<int?>("UserGroupId");

                    b.Property<string>("UserId");

                    b.Property<string>("UserName");

                    b.HasKey("Id");

                    b.HasIndex("UserGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("GroupMembers");
                });

            modelBuilder.Entity("DAL.Models.Groups.UserGroup", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("CreatedDate");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.Property<string>("UpdatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.ToTable("UserGroups");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionConfiguration", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name");

                    b.Property<int?>("QuestionPartId");

                    b.Property<string>("Value");

                    b.HasKey("Id");

                    b.HasIndex("QuestionPartId");

                    b.ToTable("QuestionConfigurations");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionOption", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("QuestionPartId");

                    b.Property<string>("Value");

                    b.HasKey("Id");

                    b.HasIndex("QuestionPartId");

                    b.ToTable("QuestionOptions");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionOptionLabels", b =>
                {
                    b.Property<int>("QuestionOptionId");

                    b.Property<int>("LabelId");

                    b.HasKey("QuestionOptionId", "LabelId");

                    b.HasIndex("LabelId");

                    b.ToTable("QuestionOptionLabels");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionPart", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<bool>("IsGroupQuestion");

                    b.Property<int?>("QuestionPartId");

                    b.Property<int?>("SurveyViewId");

                    b.Property<string>("Text");

                    b.HasKey("Id");

                    b.HasIndex("QuestionPartId");

                    b.HasIndex("SurveyViewId");

                    b.ToTable("QuestionParts");
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.ResponseValue", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ResponseType");

                    b.HasKey("Id");

                    b.ToTable("ResponseValues");

                    b.HasDiscriminator<int>("ResponseType");
                });

            modelBuilder.Entity("DAL.Models.Surveys.GroupCode", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code");

                    b.Property<DateTime>("CreatedDate");

                    b.Property<bool>("IsTest");

                    b.Property<string>("Name");

                    b.Property<int?>("SurveyId");

                    b.HasKey("Id");

                    b.HasIndex("SurveyId");

                    b.ToTable("GroupCode");
                });

            modelBuilder.Entity("DAL.Models.Surveys.Label", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDate");

                    b.Property<int?>("QuestionPartId");

                    b.Property<int?>("SurveyId");

                    b.Property<string>("Text");

                    b.Property<string>("UpdatedBy");

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("Id");

                    b.HasIndex("QuestionPartId");

                    b.HasIndex("SurveyId");

                    b.ToTable("Label");
                });

            modelBuilder.Entity("DAL.Models.Surveys.Shortcode", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code");

                    b.Property<DateTime>("CreatedDate");

                    b.Property<int?>("GroupCodeId");

                    b.Property<bool>("IsTest");

                    b.Property<int?>("SurveyId");

                    b.HasKey("Id");

                    b.HasIndex("GroupCodeId");

                    b.HasIndex("SurveyId");

                    b.ToTable("Shortcode");
                });

            modelBuilder.Entity("DAL.Models.Surveys.Survey", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Code");

                    b.Property<string>("CreatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("CreatedDate");

                    b.Property<string>("DefaultLanguage");

                    b.Property<DateTime>("EndAt");

                    b.Property<string>("Group");

                    b.Property<bool>("IsActive");

                    b.Property<bool>("IsOpen");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.Property<string>("Owner");

                    b.Property<string>("RejectionLink");

                    b.Property<DateTime>("StartAt");

                    b.Property<string>("StyleTemplate");

                    b.Property<string>("SuccessLink");

                    b.Property<string>("UpdatedBy")
                        .HasMaxLength(256);

                    b.Property<DateTime>("UpdatedDate");

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.ToTable("Surveys");
                });

            modelBuilder.Entity("DAL.Models.Surveys.SurveyPermission", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("PermissionCode");

                    b.Property<int>("SurveyId");

                    b.Property<string>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("SurveyId");

                    b.HasIndex("UserId");

                    b.ToTable("SurveyPermissions");
                });

            modelBuilder.Entity("DAL.Models.Surveys.SurveyResponse", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("QuestionPartId");

                    b.Property<int>("ResponseValueId");

                    b.HasKey("Id");

                    b.HasIndex("QuestionPartId");

                    b.HasIndex("ResponseValueId")
                        .IsUnique();

                    b.ToTable("SurveyResponse");
                });

            modelBuilder.Entity("DAL.Models.Surveys.SurveyView", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("SurveyId");

                    b.HasKey("Id");

                    b.HasIndex("SurveyId");

                    b.ToTable("SurveyViews");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<string>("RoleId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("LoginProvider");

                    b.Property<string>("Name");

                    b.Property<string>("Value");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens");
                });

            modelBuilder.Entity("OpenIddict.Models.OpenIddictApplication", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClientId")
                        .IsRequired();

                    b.Property<string>("ClientSecret");

                    b.Property<string>("ConcurrencyToken")
                        .IsConcurrencyToken();

                    b.Property<string>("ConsentType");

                    b.Property<string>("DisplayName");

                    b.Property<string>("Permissions");

                    b.Property<string>("PostLogoutRedirectUris");

                    b.Property<string>("Properties");

                    b.Property<string>("RedirectUris");

                    b.Property<string>("Type")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .IsUnique();

                    b.ToTable("OpenIddictApplications");
                });

            modelBuilder.Entity("OpenIddict.Models.OpenIddictAuthorization", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ApplicationId");

                    b.Property<string>("ConcurrencyToken")
                        .IsConcurrencyToken();

                    b.Property<string>("Properties");

                    b.Property<string>("Scopes");

                    b.Property<string>("Status")
                        .IsRequired();

                    b.Property<string>("Subject")
                        .IsRequired();

                    b.Property<string>("Type")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ApplicationId");

                    b.ToTable("OpenIddictAuthorizations");
                });

            modelBuilder.Entity("OpenIddict.Models.OpenIddictScope", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyToken")
                        .IsConcurrencyToken();

                    b.Property<string>("Description");

                    b.Property<string>("DisplayName");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("Properties");

                    b.Property<string>("Resources");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("OpenIddictScopes");
                });

            modelBuilder.Entity("OpenIddict.Models.OpenIddictToken", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ApplicationId");

                    b.Property<string>("AuthorizationId");

                    b.Property<string>("ConcurrencyToken")
                        .IsConcurrencyToken();

                    b.Property<DateTimeOffset?>("CreationDate");

                    b.Property<DateTimeOffset?>("ExpirationDate");

                    b.Property<string>("Payload");

                    b.Property<string>("Properties");

                    b.Property<string>("ReferenceId");

                    b.Property<string>("Status");

                    b.Property<string>("Subject")
                        .IsRequired();

                    b.Property<string>("Type")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ApplicationId");

                    b.HasIndex("AuthorizationId");

                    b.HasIndex("ReferenceId")
                        .IsUnique();

                    b.ToTable("OpenIddictTokens");
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.DecimalResponse", b =>
                {
                    b.HasBaseType("DAL.Models.ResponseTypes.ResponseValue");

                    b.Property<double>("Value");

                    b.ToTable("DecimalResponse");

                    b.HasDiscriminator().HasValue(2);
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.IntegerResponse", b =>
                {
                    b.HasBaseType("DAL.Models.ResponseTypes.ResponseValue");

                    b.Property<int>("Value")
                        .HasColumnName("IntegerResponse_Value");

                    b.ToTable("IntegerResponse");

                    b.HasDiscriminator().HasValue(4);
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.JsonResponse", b =>
                {
                    b.HasBaseType("DAL.Models.ResponseTypes.ResponseValue");


                    b.ToTable("JsonResponse");

                    b.HasDiscriminator().HasValue(6);
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.LocationResponse", b =>
                {
                    b.HasBaseType("DAL.Models.ResponseTypes.ResponseValue");

                    b.Property<string>("Address");

                    b.Property<double>("Latitude");

                    b.Property<double>("Longitude");

                    b.ToTable("LocationResponse");

                    b.HasDiscriminator().HasValue(3);
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.OptionListResponse", b =>
                {
                    b.HasBaseType("DAL.Models.ResponseTypes.ResponseValue");


                    b.ToTable("OptionListResponse");

                    b.HasDiscriminator().HasValue(5);
                });

            modelBuilder.Entity("DAL.Models.ResponseTypes.StringResponse", b =>
                {
                    b.HasBaseType("DAL.Models.ResponseTypes.ResponseValue");

                    b.Property<string>("Value")
                        .HasColumnName("StringResponse_Value");

                    b.ToTable("StringResponse");

                    b.HasDiscriminator().HasValue(1);
                });

            modelBuilder.Entity("DAL.Models.Groups.ApiKeys", b =>
                {
                    b.HasOne("DAL.Models.Groups.UserGroup", "Group")
                        .WithOne("ApiKeySettings")
                        .HasForeignKey("DAL.Models.Groups.ApiKeys", "Id")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("DAL.Models.Groups.EmailTemplate", b =>
                {
                    b.HasOne("DAL.Models.Groups.UserGroup", "Group")
                        .WithMany("EmailTemplates")
                        .HasForeignKey("GroupId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("DAL.Models.Groups.GroupMember", b =>
                {
                    b.HasOne("DAL.Models.Groups.UserGroup", "UserGroup")
                        .WithMany("Members")
                        .HasForeignKey("UserGroupId");

                    b.HasOne("DAL.Models.ApplicationUser", "User")
                        .WithMany("Groups")
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionConfiguration", b =>
                {
                    b.HasOne("DAL.Models.Questions.QuestionPart")
                        .WithMany("QuestionSettings")
                        .HasForeignKey("QuestionPartId");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionOption", b =>
                {
                    b.HasOne("DAL.Models.Questions.QuestionPart")
                        .WithMany("QuestionOptions")
                        .HasForeignKey("QuestionPartId");
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionOptionLabels", b =>
                {
                    b.HasOne("DAL.Models.Surveys.Label", "Label")
                        .WithMany()
                        .HasForeignKey("LabelId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("DAL.Models.Questions.QuestionOption", "QuestionOption")
                        .WithMany("QuestionOptionLabels")
                        .HasForeignKey("QuestionOptionId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("DAL.Models.Questions.QuestionPart", b =>
                {
                    b.HasOne("DAL.Models.Questions.QuestionPart")
                        .WithMany("QuestionPartChildren")
                        .HasForeignKey("QuestionPartId");

                    b.HasOne("DAL.Models.Surveys.SurveyView", "SurveyView")
                        .WithMany("QuestionParts")
                        .HasForeignKey("SurveyViewId");
                });

            modelBuilder.Entity("DAL.Models.Surveys.GroupCode", b =>
                {
                    b.HasOne("DAL.Models.Surveys.Survey", "Survey")
                        .WithMany("GroupCodes")
                        .HasForeignKey("SurveyId");
                });

            modelBuilder.Entity("DAL.Models.Surveys.Label", b =>
                {
                    b.HasOne("DAL.Models.Questions.QuestionPart")
                        .WithMany("TextLabels")
                        .HasForeignKey("QuestionPartId");

                    b.HasOne("DAL.Models.Surveys.Survey")
                        .WithMany("TitleLabel")
                        .HasForeignKey("SurveyId");
                });

            modelBuilder.Entity("DAL.Models.Surveys.Shortcode", b =>
                {
                    b.HasOne("DAL.Models.Surveys.GroupCode", "GroupCode")
                        .WithMany()
                        .HasForeignKey("GroupCodeId");

                    b.HasOne("DAL.Models.Surveys.Survey", "Survey")
                        .WithMany("Shortcodes")
                        .HasForeignKey("SurveyId");
                });

            modelBuilder.Entity("DAL.Models.Surveys.SurveyPermission", b =>
                {
                    b.HasOne("DAL.Models.Surveys.Survey", "Survey")
                        .WithMany("SurveyPermissions")
                        .HasForeignKey("SurveyId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("DAL.Models.ApplicationUser", "User")
                        .WithMany("SurveyPermissions")
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("DAL.Models.Surveys.SurveyResponse", b =>
                {
                    b.HasOne("DAL.Models.Questions.QuestionPart", "QuestionPart")
                        .WithMany()
                        .HasForeignKey("QuestionPartId");

                    b.HasOne("DAL.Models.ResponseTypes.ResponseValue", "ResponseValue")
                        .WithOne("SurveyResponse")
                        .HasForeignKey("DAL.Models.Surveys.SurveyResponse", "ResponseValueId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("DAL.Models.Surveys.SurveyView", b =>
                {
                    b.HasOne("DAL.Models.Surveys.Survey", "Survey")
                        .WithMany("SurveyViews")
                        .HasForeignKey("SurveyId");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("DAL.Models.ApplicationRole")
                        .WithMany("Claims")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("DAL.Models.ApplicationUser")
                        .WithMany("Claims")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("DAL.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("DAL.Models.ApplicationRole")
                        .WithMany("Users")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("DAL.Models.ApplicationUser")
                        .WithMany("Roles")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("DAL.Models.ApplicationUser")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("OpenIddict.Models.OpenIddictAuthorization", b =>
                {
                    b.HasOne("OpenIddict.Models.OpenIddictApplication", "Application")
                        .WithMany("Authorizations")
                        .HasForeignKey("ApplicationId");
                });

            modelBuilder.Entity("OpenIddict.Models.OpenIddictToken", b =>
                {
                    b.HasOne("OpenIddict.Models.OpenIddictApplication", "Application")
                        .WithMany("Tokens")
                        .HasForeignKey("ApplicationId");

                    b.HasOne("OpenIddict.Models.OpenIddictAuthorization", "Authorization")
                        .WithMany("Tokens")
                        .HasForeignKey("AuthorizationId");
                });
#pragma warning restore 612, 618
        }
    }
}
