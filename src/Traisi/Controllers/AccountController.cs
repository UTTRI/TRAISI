using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Traisi.Authorization;
using Traisi.Data;
using Traisi.Data.Core;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;
using Traisi.Helpers;
using Traisi.ViewModels;
using Traisi.ViewModels.Users;

namespace Traisi.Controllers {
	[Authorize (Authorization.Policies.AccessAdminPolicy)]
	[Route ("api/[controller]")]
	public class AccountController : Controller {
		private readonly IAccountManager _accountManager;
		private readonly IAuthorizationService _authorizationService;

		private readonly UserManager<TraisiUser> _userManager;
		private readonly IUnitOfWork _unitOfWork;
		private readonly IMailgunMailer _emailer;

		private readonly IConfiguration _configuration;

		private const string GetUserByIdActionName = "GetUserById";
		private const string GetRoleByIdActionName = "GetRoleById";

		private readonly IStringLocalizer<AccountController> _localizer;

        private readonly IMapper _mapper;

		public AccountController (IAccountManager accountManager,
			IAuthorizationService authorizationService,
			UserManager<TraisiUser> userManager,
			IUnitOfWork unitOfWork, IMailgunMailer emailer, IConfiguration configuration, IStringLocalizer<AccountController> localizer,
            IMapper mapper) {
			_accountManager = accountManager;
			_authorizationService = authorizationService;
			_unitOfWork = unitOfWork;
			_emailer = emailer;
			_configuration = configuration;
			_localizer = localizer;
			_userManager = userManager;
            _mapper = mapper;

        }

		[HttpGet ("users/me")]
		[Produces (typeof (UserViewModel))]
		public async Task<IActionResult> GetCurrentUser () {

			return await GetUserByUserName (this.User.Identity.Name);
		}

		[HttpGet ("users/{id}", Name = GetUserByIdActionName)]
		[Produces (typeof (UserViewModel))]
		public async Task<IActionResult> GetUserById (string id) {
			if (!(await _authorizationService.AuthorizeAsync (this.User, id, AccountManagementOperations.Read)).Succeeded)
				return new ChallengeResult ();

			UserViewModel userVM = await GetUserViewModelHelper (id);

			if (userVM != null)
				return Ok (userVM);
			else
				return NotFound (id);
		}

		[HttpGet ("users/username/{userName}")]
		[Produces (typeof (UserViewModel))]
		public async Task<IActionResult> GetUserByUserName (string userName) {
			ApplicationUser appUser = await _accountManager.GetUserByUserNameAsync (userName);

			if (!(await _authorizationService.AuthorizeAsync (this.User, appUser?.Id ?? "", AccountManagementOperations.Read)).Succeeded)
				return new ChallengeResult ();

			if (appUser == null)
				return NotFound (userName);

			return await GetUserById (appUser.Id);
		}

		[HttpGet ("users")]
		[Produces (typeof (List<UserViewModel>))]
		[Authorize (Authorization.Policies.ViewAllUsersPolicy)]
		public async Task<IActionResult> GetUsers () {
			return await GetUsers (-1, -1);
		}

		[HttpGet ("users/{page:int}/{pageSize:int}")]
		[Produces (typeof (List<UserViewModel>))]
		[Authorize (Authorization.Policies.ViewAllUsersPolicy)]
		public async Task<IActionResult> GetUsers (int page, int pageSize) {
			var usersAndRoles = await _accountManager.GetUsersAndRolesAsync (page, pageSize);

			List<UserViewModel> usersVM = new List<UserViewModel> ();

			foreach (var item in usersAndRoles) {
				var userVM = _mapper.Map<UserViewModel> (item.Item1);
				userVM.Roles = item.Item2;

				usersVM.Add (userVM);
			}

			return Ok (usersVM);
		}

		[HttpGet ("users/solo")]
		[Produces (typeof (List<UserViewModel>))]
		[Authorize (Authorization.Policies.ViewAllUsersPolicy)]
		public async Task<IActionResult> GetSoloUsers () {

			return await GetSoloUsers (-1, -1);
		}

		[HttpGet ("users/solo/{page:int}/{pageSize:int}")]
		[Produces (typeof (List<UserViewModel>))]
		[Authorize (Authorization.Policies.ViewAllUsersPolicy)]
		public async Task<IActionResult> GetSoloUsers (int page, int pageSize) {
			var usersAndRoles = await _accountManager.GetSoloUsersAndRolesAsync (page, pageSize);

			List<UserViewModel> usersVM = new List<UserViewModel> ();

			foreach (var item in usersAndRoles) {
				var userVM = _mapper.Map<UserViewModel> (item.Item1);
				userVM.Roles = item.Item2;

				usersVM.Add (userVM);
			}

			return Ok (usersVM);
		}

		[HttpPut ("users/me")]
		public async Task<IActionResult> UpdateCurrentUser ([FromBody] UserEditViewModel user) {
			return await UpdateUser (Utilities.GetUserId (this.User), user);
		}

		[HttpPut ("users/{id}")]
		public async Task<IActionResult> UpdateUser (string id, [FromBody] UserEditViewModel user) {
			ApplicationUser appUser = await _accountManager.GetUserByIdAsync (id);
			string[] currentRoles = appUser != null ? (await _accountManager.GetUserRolesAsync (appUser)).ToArray () : null;

			var manageUsersPolicy = _authorizationService.AuthorizeAsync (this.User, id, AccountManagementOperations.Update);
			var assignRolePolicy = _authorizationService.AuthorizeAsync (this.User, Tuple.Create (user.Roles, currentRoles), Authorization.Policies.AssignAllowedRolesPolicy);

			if ((await Task.WhenAll (manageUsersPolicy, assignRolePolicy)).Any (r => !r.Succeeded))
				return new ChallengeResult ();

			if (ModelState.IsValid) {
				if (user == null)
					return BadRequest ($"{nameof(user)} cannot be null");

				if (!string.IsNullOrWhiteSpace (user.Id) && id != user.Id)
					return BadRequest ("Conflicting user id in parameter and model data");

				if (appUser == null)
					return NotFound (id);

				if (Utilities.GetUserId (this.User) == id && string.IsNullOrWhiteSpace (user.CurrentPassword)) {
					if (!string.IsNullOrWhiteSpace (user.NewPassword))
						return BadRequest ("Current password is required when changing your own password");

					if (appUser.UserName != user.UserName)
						return BadRequest ("Current password is required when changing your own username");
				}

				bool isValid = true;

				if (Utilities.GetUserId (this.User) == id && (appUser.UserName != user.UserName || !string.IsNullOrWhiteSpace (user.NewPassword))) {
					if (!await _accountManager.CheckPasswordAsync (appUser, user.CurrentPassword)) {
						isValid = false;
						AddErrors (new string[] { "The username/password couple is invalid." });
					}
				}

				if (isValid) {
					_mapper.Map<UserViewModel, ApplicationUser> (user, appUser);

					var result = await _accountManager.UpdateUserAsync (appUser, user.Roles);
					if (result.Item1) {
						if (!string.IsNullOrWhiteSpace (user.NewPassword)) {
							if (!string.IsNullOrWhiteSpace (user.CurrentPassword))
								result = await _accountManager.UpdatePasswordAsync (appUser, user.CurrentPassword, user.NewPassword);
							else
								result = await _accountManager.ResetPasswordAsync (appUser, user.NewPassword);
						}

						if (result.Item1)
							return NoContent ();
					}

					AddErrors (result.Item2);
				}
			}

			return BadRequest (ModelState);
		}

		[HttpPatch ("users/me")]
		public async Task<IActionResult> UpdateCurrentUser ([FromBody] JsonPatchDocument<UserPatchViewModel> patch) {
			return await UpdateUser (Utilities.GetUserId (this.User), patch);
		}

		[HttpPatch ("users/{id}")]
		public async Task<IActionResult> UpdateUser (string id, [FromBody] JsonPatchDocument<UserPatchViewModel> patch) {
			if (!(await _authorizationService.AuthorizeAsync (this.User, id, AccountManagementOperations.Update)).Succeeded)
				return new ChallengeResult ();

			if (ModelState.IsValid) {
				if (patch == null)
					return BadRequest ($"{nameof(patch)} cannot be null");

				ApplicationUser appUser = await _accountManager.GetUserByIdAsync (id);

				if (appUser == null)
					return NotFound (id);

				UserPatchViewModel userPVM = _mapper.Map<UserPatchViewModel> (appUser);
				patch.ApplyTo (userPVM, ModelState);

				if (ModelState.IsValid) {
					_mapper.Map<UserPatchViewModel, ApplicationUser> (userPVM, appUser);

					var result = await _accountManager.UpdateUserAsync (appUser);
					if (result.Item1)
						return NoContent ();

					AddErrors (result.Item2);
				}
			}

			return BadRequest (ModelState);
		}

		[HttpPost ("users")]
		public async Task<IActionResult> Register ([FromBody] UserEditViewModel user) {
			//if (!(await _authorizationService.AuthorizeAsync (this.User, Tuple.Create (user.Roles, new string[] { }), Authorization.Policies.AssignAllowedRolesPolicy)).Succeeded)
			//    return new ChallengeResult ();

			try {
				var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync (this.User, Authorization.Policies.ViewAllUsersPolicy);
				bool isGroupAdmin = await this.CanAdminGroups ();

				if (!viewAllUsersPolicy.Succeeded && !isGroupAdmin)
					return new ChallengeResult ();

				if (ModelState.IsValid) {
					if (user == null)
						return BadRequest ($"{nameof(user)} cannot be null");

					// force user type to be 'user' to avoid any other type being set through here
					// user.Roles = new string[] { "user" };

					TraisiUser appUser = _mapper.Map<TraisiUser> (user);

					var result = await _accountManager.CreateUserAsync (appUser, user.Roles, user.NewPassword);
					if (result.Item1) {
						MailgunEmail regEmail = new MailgunEmail () {
							Receipient = appUser.Email,
								Subject = _localizer["RegistrationEmailSubject"],
								Template = "RegistrationEmail",
								TemplateReplacements = new Dictionary<string, string> () { { "user_name", appUser.UserName }, { "password", user.NewPassword } }
						};
						this._emailer.SendEmail (regEmail);
						/*var (emailRegSuccess, errorMessage) = await this._emailer.SendEmailAsync(regEmail);
                        if (!emailRegSuccess)
                        {
                            AddErrors(new string[] { errorMessage });
                        }*/
						UserViewModel userVM = await GetUserViewModelHelper (appUser.Id);
						return CreatedAtAction (GetUserByIdActionName, new { id = userVM.Id }, userVM);
					}

					AddErrors (result.Item2);
				}

				return BadRequest (ModelState);
			} catch (System.Exception ex) {
				return BadRequest ("User Creation Failed: " + ex.Message);
			}
		}

		[HttpDelete ("users/{id}")]
		[Produces (typeof (UserViewModel))]
		public async Task<IActionResult> DeleteUser (string id) {
			if (!(await _authorizationService.AuthorizeAsync (this.User, id, AccountManagementOperations.Delete)).Succeeded)
				return new ChallengeResult ();

			if (!await _accountManager.TestCanDeleteUserAsync (id))
				return BadRequest ("User cannot be deleted. Delete all orders associated with this user and try again");

			UserViewModel userVM = null;
			ApplicationUser appUser = await this._accountManager.GetUserByIdAsync (id);

			if (appUser != null)
				userVM = await GetUserViewModelHelper (appUser.Id);

			if (userVM == null)
				return NotFound (id);

			var result = await this._accountManager.DeleteUserAsync (appUser);
			if (!result.Item1)
				throw new Exception ("The following errors occurred whilst deleting user: " + string.Join (", ", result.Item2));

			return Ok (userVM);
		}

		[HttpPut ("users/unblock/{id}")]
		[Authorize (Authorization.Policies.ManageAllUsersPolicy)]
		public async Task<IActionResult> UnblockUser (string id) {
			ApplicationUser appUser = await this._accountManager.GetUserByIdAsync (id);

			if (appUser == null)
				return NotFound (id);

			appUser.LockoutEnd = null;
			var result = await _accountManager.UpdateUserAsync (appUser);
			if (!result.Item1)
				throw new Exception ("The following errors occurred whilst unblocking user: " + string.Join (", ", result.Item2));

			return NoContent ();
		}

		[HttpGet ("users/me/preferences")]
		[Produces (typeof (string))]
		public async Task<IActionResult> UserPreferences () {
			var userId = Utilities.GetUserId (this.User);
			ApplicationUser appUser = await this._accountManager.GetUserByIdAsync (userId);

			if (appUser != null)
				return Ok (appUser.Configuration);
			else
				return NotFound (userId);
		}

		[HttpPut ("users/me/preferences")]
		public async Task<IActionResult> UserPreferences ([FromBody] string data) {
			var userId = Utilities.GetUserId (this.User);
			ApplicationUser appUser = await this._accountManager.GetUserByIdAsync (userId);

			if (appUser == null)
				return NotFound (userId);

			appUser.Configuration = data;
			var result = await _accountManager.UpdateUserAsync (appUser);
			if (!result.Item1)
				throw new Exception ("The following errors occurred whilst updating User Configurations: " + string.Join (", ", result.Item2));

			return NoContent ();
		}

		[HttpGet ("roles/{id}", Name = GetRoleByIdActionName)]
		[Produces (typeof (RoleViewModel))]
		public async Task<IActionResult> GetRoleById (string id) {
			var appRole = await _accountManager.GetRoleByIdAsync (id);

			if (!(await _authorizationService.AuthorizeAsync (this.User, appRole?.Name ?? "", Authorization.Policies.ViewRoleByRoleNamePolicy)).Succeeded)
				return new ChallengeResult ();

			if (appRole == null)
				return NotFound (id);

			return await GetRoleByName (appRole.Name);
		}

		[HttpGet ("roles/name/{name}")]
		[Produces (typeof (RoleViewModel))]
		public async Task<IActionResult> GetRoleByName (string name) {
			if (!(await _authorizationService.AuthorizeAsync (this.User, name, Authorization.Policies.ViewRoleByRoleNamePolicy)).Succeeded)
				return new ChallengeResult ();

			RoleViewModel roleVM = await GetRoleViewModelHelper (name);

			if (roleVM == null)
				return NotFound (name);

			return Ok (roleVM);
		}

		[HttpGet ("roles")]
		[Produces (typeof (List<RoleViewModel>))]
		public async Task<IActionResult> GetRoles () {
			return await GetRoles (-1, -1);
		}

		[HttpGet ("roles/{page:int}/{pageSize:int}")]
		[Produces (typeof (List<RoleViewModel>))]
		public async Task<IActionResult> GetRoles (int page, int pageSize) {
			var roles = await _accountManager.GetRolesLoadRelatedAsync (page, pageSize);
			return Ok (_mapper.Map<List<RoleViewModel>> (roles));
		}

		[HttpPut ("roles/{id}")]
		[Authorize (Authorization.Policies.ManageAllRolesPolicy)]
		public async Task<IActionResult> UpdateRole (string id, [FromBody] RoleViewModel role) {
			if (ModelState.IsValid) {
				if (role == null)
					return BadRequest ($"{nameof(role)} cannot be null");

				if (!string.IsNullOrWhiteSpace (role.Id) && id != role.Id)
					return BadRequest ("Conflicting role id in parameter and model data");

				ApplicationRole appRole = await _accountManager.GetRoleByIdAsync (id);

				if (appRole == null)
					return NotFound (id);

				if (appRole.Name == "super administrator") {
					string[] saError = new string[] { "Cannot modify super administrator privileges" };
					AddErrors (saError);
				} else {
					_mapper.Map<RoleViewModel, ApplicationRole> (role, appRole);

					var result = await _accountManager.UpdateRoleAsync (appRole, role.Permissions?.Select (p => p.Value).ToArray ());
					if (result.Item1)
						return NoContent ();

					AddErrors (result.Item2);
				}

			}

			return BadRequest (ModelState);
		}

		[HttpPost ("roles")]
		[Authorize (Authorization.Policies.ManageAllRolesPolicy)]
		public async Task<IActionResult> CreateRole ([FromBody] RoleViewModel role) {
			if (ModelState.IsValid) {
				if (role == null)
					return BadRequest ($"{nameof(role)} cannot be null");

				ApplicationRole appRole = _mapper.Map<ApplicationRole> (role);

				var result = await _accountManager.CreateRoleAsync (appRole, role.Permissions?.Select (p => p.Value).ToArray ());
				if (result.Item1) {
					RoleViewModel roleVM = await GetRoleViewModelHelper (appRole.Name);
					return CreatedAtAction (GetRoleByIdActionName, new { id = roleVM.Id }, roleVM);
				}

				AddErrors (result.Item2);
			}

			return BadRequest (ModelState);
		}

		[HttpDelete ("roles/{id}")]
		[Produces (typeof (RoleViewModel))]
		[Authorize (Authorization.Policies.ManageAllRolesPolicy)]
		public async Task<IActionResult> DeleteRole (string id) {
			if (!await _accountManager.TestCanDeleteRoleAsync (id))
				return BadRequest ("Role cannot be deleted. Remove all users from this role and try again");

			RoleViewModel roleVM = null;
			ApplicationRole appRole = await this._accountManager.GetRoleByIdAsync (id);

			if (appRole != null)
				roleVM = await GetRoleViewModelHelper (appRole.Name);

			if (roleVM == null)
				return NotFound (id);

			var result = await this._accountManager.DeleteRoleAsync (appRole);
			if (!result.Item1)
				throw new Exception ("The following errors occurred whilst deleting role: " + string.Join (", ", result.Item2));

			return Ok (roleVM);
		}

		[HttpGet ("users/account/{userId}")]
		[Produces (typeof (List<PermissionViewModel>))]
		public async Task<IActionResult> GetUserAccountById (string userId) {
			var user = await this._userManager.GetUserAsync (HttpContext.User);

			if (user == null) {
				return new NotFoundResult ();
			} else {
				var roles = await this._userManager.GetRolesAsync (user);
				return new ObjectResult ((user, roles));
			}
		}

		[HttpGet ("permissions")]
		[Produces (typeof (List<PermissionViewModel>))]
		[Authorize (Authorization.Policies.ViewAllRolesPolicy)]
		public IActionResult GetAllPermissions () {
			return Ok (_mapper.Map<List<PermissionViewModel>> (ApplicationPermissions.AllPermissions));
		}

		private async Task<UserViewModel> GetUserViewModelHelper (string userId) {
			var userAndRoles = await _accountManager.GetUserAndRolesAsync (userId);
			if (userAndRoles == null)
				return null;

			var userVM = _mapper.Map<UserViewModel> (userAndRoles.Item1);
			userVM.Roles = userAndRoles.Item2;

			return userVM;
		}

		private async Task<RoleViewModel> GetRoleViewModelHelper (string roleName) {
			var role = await _accountManager.GetRoleLoadRelatedAsync (roleName);
			if (role != null)
				return _mapper.Map<RoleViewModel> (role);

			return null;
		}

		private async Task<bool> CanAdminGroups () {
			var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync (this.User, Authorization.Policies.ViewAllUsersPolicy);
			IEnumerable<UserGroup> groups;
			if (viewAllUsersPolicy.Succeeded) {
				return true;
			} else {
				groups = await this._unitOfWork.UserGroups.GetAllGroupsForAdminAsync (this.User.Identity.Name);
				return groups.Count () > 0;
			}
		}

		private void AddErrors (IEnumerable<string> errors) {
			foreach (var error in errors) {
				ModelState.AddModelError (string.Empty, error);
			}
		}

	}
}