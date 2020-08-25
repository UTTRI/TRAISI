using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Traisi.Authorization {
	public class Policies {
		///<summary>Policy to allow access of the admin interface.</summary>
		public const string AccessAdminPolicy = "Access Admin Interface";

		///<summary>Policy to allow viewing all user records.</summary>
		public const string ViewAllUsersPolicy = "View All Users";

		///<summary>Policy to allow adding, removing and updating all user records.</summary>
		public const string ManageAllUsersPolicy = "Manage All Users";

		/// <summary>
		/// Policy to allow adding, removing and updating all groups.
		/// </summary>
		public const string ManageAllGroupsPolicy = "Manage All Groups";

		///<summary>Policy to allow viewing all user records within the group.</summary>
		public const string ViewGroupUsersPolicy = "View Group Users";

		///<summary>Policy to allow adding, removing and updating all user records within the group.</summary>
		public const string ManageGroupUsersPolicy = "Manage Group Users";

		/// <summary>Policy to allow viewing details of all roles.</summary>
		public const string ViewAllRolesPolicy = "View All Roles";

		/// <summary>Policy to allow viewing details of all or specific roles (Requires roleName as parameter).</summary>
		public const string ViewRoleByRoleNamePolicy = "View Role by RoleName";

		/// <summary>Policy to allow adding, removing and updating all roles.</summary>
		public const string ManageAllRolesPolicy = "Manage All Roles";

		/// <summary>Policy to allow assigning roles the user has access to (Requires new and current roles as parameter).</summary>
		public const string AssignAllowedRolesPolicy = "Assign Allowed Roles";

		/// <summary>Policy to allow viewing all surveys.</summary>
		public const string ViewAllSurveysPolicy = "View All Surveys";

		/// <summary>Policy to allow removing of any surveys.</summary>
		public const string ManageAllSurveysPolicy = "Manage All Surveys";

		/// <summary>Policy to allow viewing all surveys within the group.</summary>
		public const string ViewGroupSurveysPolicy = "View Group Surveys";

		/// <summary>Policy to allow removing and modifying of any surveys within the group.</summary>
		public const string ManageGroupSurveysPolicy = "Manage Group Surveys";

		/// <summary>Policy to allow adding surveys within the group.</summary>
		public const string CreateGroupSurveysPolicy = "Create Group Surveys";

		/// <summary>Policy to allow adding surveys within the group.</summary>
		public const string RespondToSurveyPolicy = "Respond to Survey";

		/// <summary>Policy to allow viewing samples within the group.</summary>
		public const string ViewAllSamplesPolicy = "View All Samples";

	}

	/// <summary>
	/// Operation Policy to allow adding, viewing, updating and deleting general or specific user records.
	/// </summary>
	public static class AccountManagementOperations {
		public const string CreateOperationName = "Create";
		public const string ReadOperationName = "Read";
		public const string UpdateOperationName = "Update";
		public const string DeleteOperationName = "Delete";

		public static UserAccountAuthorizationRequirement Create = new UserAccountAuthorizationRequirement (CreateOperationName);
		public static UserAccountAuthorizationRequirement Read = new UserAccountAuthorizationRequirement (ReadOperationName);
		public static UserAccountAuthorizationRequirement Update = new UserAccountAuthorizationRequirement (UpdateOperationName);
		public static UserAccountAuthorizationRequirement Delete = new UserAccountAuthorizationRequirement (DeleteOperationName);
	}
}