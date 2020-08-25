using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.ObjectModel;

namespace Traisi.Data.Core
{
    public static class ApplicationPermissions
    {
        public static ReadOnlyCollection<ApplicationPermission> AllPermissions;


        public const string UsersPermissionGroupName = "User Permissions";
        public static ApplicationPermission ViewUsers = new ApplicationPermission("View All Users", "users.view", UsersPermissionGroupName, "Permission to view other users account details");
        public static ApplicationPermission ManageUsers = new ApplicationPermission("Manage All Users", "users.manage", UsersPermissionGroupName, "Permission to create, delete and modify other users account details");

        public static ApplicationPermission ManageGroups = new ApplicationPermission("Manage All Groups", "groups.manage", UsersPermissionGroupName, "Permission to create, delete and modify all groups");
        public static ApplicationPermission ViewGroupUsers = new ApplicationPermission("View Group Users", "users.viewgroup", UsersPermissionGroupName, "Permission to view other users account details within the group");
        public static ApplicationPermission ManageGroupUsers = new ApplicationPermission("Manage Group Users", "users.managegroup", UsersPermissionGroupName, "Permission to create, delete and modify other users account details within the group");

        public const string SurveysPermissionGroupName = "Survey Permissions";
        public static ApplicationPermission ViewSurveys = new ApplicationPermission("View All User Surveys", "surveys.view", SurveysPermissionGroupName, "Permission to view other surveys");
        public static ApplicationPermission ManageSurveys = new ApplicationPermission("Manage All Surveys", "surveys.manage", SurveysPermissionGroupName, "Permission to delete surveys");
        public static ApplicationPermission ViewGroupSurveys = new ApplicationPermission("View Group Surveys", "surveys.viewgroup", SurveysPermissionGroupName, "Permission to view other surveys within the group");
        public static ApplicationPermission ManageGroupSurveys = new ApplicationPermission("Manage Group Surveys", "surveys.managegroup", SurveysPermissionGroupName, "Permission to delete and modify surveys within the group");
        public static ApplicationPermission CreateGroupSurveys = new ApplicationPermission("Create Group Surveys", "surveys.create", SurveysPermissionGroupName, "Permission to create surveys within the group");

        public const string RolesPermissionGroupName = "Role Permissions";
        public static ApplicationPermission ViewRoles = new ApplicationPermission("View Roles", "roles.view", RolesPermissionGroupName, "Permission to view available roles");
        public static ApplicationPermission ManageRoles = new ApplicationPermission("Manage Roles", "roles.manage", RolesPermissionGroupName, "Permission to create, delete and modify roles");
        public static ApplicationPermission AssignRoles = new ApplicationPermission("Assign Roles", "roles.assign", RolesPermissionGroupName, "Permission to assign roles to users");

        public const string SystemPermissionGroupName = "System Permissions";
        public static ApplicationPermission AccessAdmin = new ApplicationPermission("Access Admin", "system.accessadmin", SystemPermissionGroupName, "Permission to access admin interface");

        public static ApplicationPermission ViewAllSamples = new ApplicationPermission("View All Samples", "samples.view", SystemPermissionGroupName, "Permission to view all samples");
    
        static ApplicationPermissions()
        {
            List<ApplicationPermission> allPermissions = new List<ApplicationPermission>()
            {
                AccessAdmin,
                
                ViewUsers,
                ManageUsers,
                ManageGroups,
                ViewGroupUsers,
                ManageGroupUsers,

                ViewRoles,
                ManageRoles,
                AssignRoles,

                ViewSurveys,
                ManageSurveys,
                ViewGroupSurveys,
                ManageGroupSurveys,
                CreateGroupSurveys,

                ViewAllSamples
               
            };

            AllPermissions = allPermissions.AsReadOnly();
        }




        public static ApplicationPermission GetPermissionByName(string permissionName)
        {
            return AllPermissions.Where(p => p.Name == permissionName).FirstOrDefault();
        }

        public static ApplicationPermission GetPermissionByValue(string permissionValue)
        {
            return AllPermissions.Where(p => p.Value == permissionValue).FirstOrDefault();
        }

        public static string[] GetAllPermissionValues()
        {
            return AllPermissions.Select(p => p.Value).ToArray();
        }

        public static string[] GetAllGroupPermissionValues()
        {
            return AllPermissions.Where(p => p.Name.Contains("Group")).Select(p => p.Value).ToArray();
        }

        public static string[] GetAdministrativePermissionValues()
        {
            return new string[] { AccessAdmin };
        }
    }

    public static class SurveyPermissions
    {
        public static ReadOnlyCollection<ApplicationPermission> AllSurveyPermissions;

        public const string SurveySpecificPermissionGroupName = "Survey Specific Permissions";
        public static ApplicationPermission ViewSurvey = new ApplicationPermission("View Survey", "survey.view", SurveySpecificPermissionGroupName, "Permission to view specified survey");
        public static ApplicationPermission ModifySurvey = new ApplicationPermission("Modify Survey", "survey.modify", SurveySpecificPermissionGroupName, "Permission to modify specified survey");
        public static ApplicationPermission DeleteSurvey = new ApplicationPermission("Delete Survey", "survey.delete", SurveySpecificPermissionGroupName, "Permission to delete specified survey");

        public static ApplicationPermission ExecuteSurvey = new ApplicationPermission("Execute Survey", "survey.execute", SurveySpecificPermissionGroupName, "Permission to execute specified survey (i.e. generate shortcodes, email invites, etc.)");
        public static ApplicationPermission AnalyzeSurvey = new ApplicationPermission("Analyze Survey", "survey.analyze", SurveySpecificPermissionGroupName, "Permission to analyze specified survey");
        public static ApplicationPermission Interview = new ApplicationPermission("Interview", "survey.interview", SurveySpecificPermissionGroupName, "Permission to conduct CATI interviews for specified survey");
        public static ApplicationPermission ShareSurvey = new ApplicationPermission("Share Survey", "survey.share", SurveySpecificPermissionGroupName, "Permission to share specified survey (i.e. manage/view survey users of specified survey)");

        static SurveyPermissions()
        {
            List<ApplicationPermission> allSurveyPermissions = new List<ApplicationPermission>()
            {
                ViewSurvey,
                ModifySurvey,
                DeleteSurvey,
                ExecuteSurvey,
                AnalyzeSurvey,
                Interview,
                ShareSurvey
            };

            AllSurveyPermissions = allSurveyPermissions.AsReadOnly();
        }

        public static string[] ConvertPermissionCodeToList(string code)
        {
            List<string> permissionsList = new List<string>();
            for (int i = 0; i < AllSurveyPermissions.Count; i++)
            {
                if (code[i] == '1')
                {
                    permissionsList.Add(AllSurveyPermissions[i].Value);
                }
            }
            return permissionsList.ToArray();
        }

        public static string ConvertPermissionsListToCode(string[] permissions)
        {
            StringBuilder codeBuilder = new StringBuilder("", AllSurveyPermissions.Count);
            foreach (var permissionValue in AllSurveyPermissions)
            {
                if (permissions.Contains(permissionValue))
                {
                    codeBuilder.Append("1");
                }
                else
                {
                    codeBuilder.Append("0");
                }
            }
            return codeBuilder.ToString();
        }


    }

    public class ApplicationPermission
    {
        public ApplicationPermission()
        { }

        public ApplicationPermission(string name, string value, string groupName, string description = null)
        {
            Name = name;
            Value = value;
            GroupName = groupName;
            Description = description;
        }



        public string Name { get; set; }
        public string Value { get; set; }
        public string GroupName { get; set; }
        public string Description { get; set; }


        public override string ToString()
        {
            return Value;
        }


        public static implicit operator string(ApplicationPermission permission)
        {
            return permission.Value;
        }
    }

}