using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Core;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Models.Groups;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Traisi.Data.Models.Questions;
using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;

namespace Traisi.Data
{
    public interface IDatabaseInitializer
    {
        Task SeedAsync();
    }

    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccountManager _accountManager;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager, ILogger<DatabaseInitializer> logger,
        IConfiguration configuration)
        {
            _accountManager = accountManager;
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SeedAsync()
        {
            await _context.Database.MigrateAsync().ConfigureAwait(false);

            // await _context.Database.EnsureCreatedAsync();
            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Generating inbuilt accounts");

                const string adminRoleName = "super administrator";
                const string groupAdminRoleName = "group administrator";
                const string userRoleName = "user";
                const string respondentRoleName = "respondent";
                const string managementRoleName = "management";
                const string teamleadRoleName = "teamlead";
                const string interviewerRoleName = "interviewer";
                const string qcRoleName = "qc";


                await EnsureRoleAsync(adminRoleName, "Super administrator", 0, ApplicationPermissions.GetAllPermissionValues());
                await EnsureRoleAsync(groupAdminRoleName, "Group administrator", 1, ApplicationPermissions.GetAllGroupPermissionValues());
                await EnsureRoleAsync(userRoleName, "Basic user", 2, ApplicationPermissions.GetAdministrativePermissionValues());
                await EnsureRoleAsync(respondentRoleName, "Survey Respondent", 3, new string[] { });
                await EnsureRoleAsync(managementRoleName, "Management", 4, ApplicationPermissions.GetAdministrativePermissionValues());
                await EnsureRoleAsync(interviewerRoleName, "Interviewer", 5, ApplicationPermissions.GetAdministrativePermissionValues());
                await EnsureRoleAsync(teamleadRoleName, "Team Lead", 6, ApplicationPermissions.GetAdministrativePermissionValues());
                await EnsureRoleAsync(qcRoleName, "QC Analyst", 7, ApplicationPermissions.GetAdministrativePermissionValues());

                // ensure cati roles
                await EnsureRoleAsync(respondentRoleName, "Survey Respondent", 3, new string[] { });

                var adminAccounts = _configuration.GetSection("AdminAccounts").GetChildren();

                _logger.LogInformation("Creating admin accounts.");
                if (adminAccounts.Count() == 0)
                {
                    _logger.LogError("No admin accounts exist.");
                    throw new Exception("Please create at least one admin account before the database is initialized. Use a local configuration file to provide the account information.");
                    // throw new Exception("No admin accounts in configuration.");

                }

                foreach (var section in adminAccounts)
                {
                    var username = section.GetValue<string>("Username");
                    var password = section.GetValue<string>("Password");
                    var email = section.GetValue<string>("Email") ?? "admin@traisi.dmg.utoronto.ca";
                    await CreateUserAsync(username, password, "Administrator",
                    email, "+1 (123) 000-0000", new string[] { adminRoleName });
                }

                _logger.LogInformation("Inbuilt account generation completed");
            }

            if (!await _context.UserGroups.AnyAsync())
            {
                _logger.LogInformation("Seeding initial data");

                UserGroup TTS = new UserGroup()
                {
                    Name = "TTS",
                    Members = new List<GroupMember>(),
                    ApiKeySettings = new ApiKeys() { MailgunApiKey = "TTSMail", GoogleMapsApiKey = "TTSGoogle", MapBoxApiKey = "TTSMapbox" }
                };
                _context.UserGroups.Add(TTS);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Seeding initial data completed");
            }
        }

        private async Task EnsureRoleAsync(string roleName, string description, int level, string[] claims)
        {
            if ((await _accountManager.GetRoleByNameAsync(roleName)) == null)
            {
                ApplicationRole applicationRole = new ApplicationRole(roleName, description, level);

                var result = await this._accountManager.CreateRoleAsync(applicationRole, claims);

                if (!result.Item1)
                    throw new Exception($"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, result.Item2)}");
            }
        }

        private async Task<ApplicationUser> CreateUserAsync(string userName, string password, string fullName, string email, string phoneNumber, string[] roles)
        {
            TraisiUser applicationUser = new TraisiUser
            {
                UserName = userName,
                FullName = fullName,
                Email = email,
                PhoneNumber = phoneNumber,
                EmailConfirmed = true,
                IsEnabled = true
            };

            var result = await _accountManager.CreateUserAsync(applicationUser, roles, password);

            if (!result.Item1)
                throw new Exception($"Seeding \"{userName}\" user failed. Errors: {string.Join(Environment.NewLine, result.Item2)}");

            return applicationUser;
        }



    }
}