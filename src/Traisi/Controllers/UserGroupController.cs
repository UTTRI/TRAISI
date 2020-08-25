using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Traisi.Data;
using AutoMapper;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Traisi.Authorization.Enums;
using Traisi.ViewModels;
using Traisi.ViewModels.Users;

namespace Traisi.Controllers
{
	[Authorize(Authorization.Policies.AccessAdminPolicy)]
	[Route("api/[controller]")]
	public class UserGroupController : Controller
	{

		private readonly IUnitOfWork _unitOfWork;
		private readonly IAuthorizationService _authorizationService;
		private readonly IAccountManager _accountManager;

		private readonly UserManager<TraisiUser> _userManager;

		private readonly RoleManager<ApplicationRole> _roleManager;
		private readonly IMapper _mapper;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="unitOfWork"></param>
		/// <param name="authorizationService"></param>
		/// <param name="accountManager"></param>
		/// <param name="userManager"></param>
		/// <param name="roleManager"></param>
		public UserGroupController(IUnitOfWork unitOfWork, IAuthorizationService authorizationService, IAccountManager accountManager,
		UserManager<TraisiUser> userManager,
		RoleManager<ApplicationRole> roleManager,
		IMapper mapper)
		{
			this._unitOfWork = unitOfWork;
			this._authorizationService = authorizationService;
			this._accountManager = accountManager;
			this._userManager = userManager;
			this._roleManager = roleManager;
			this._mapper = mapper;
		}

		/// <summary>
		/// Get user group by ID
		/// </summary>
		[HttpGet("{id}")]
		[Produces(typeof(UserGroupViewModel))]
		public async Task<IActionResult> GetGroup(int id)
		{
			var group = await this._unitOfWork.UserGroups.GetGroupWithMembersAsync(id);
			//two user types can access: superadmin or any group member
			var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ViewAllUsersPolicy);
			if (viewAllUsersPolicy.Succeeded)
			{
				return Ok(_mapper.Map<UserGroupViewModel>(group));
			}
			else
			{
				var memberOfGroup = await this._unitOfWork.GroupMembers.IsMemberOfGroupAsync(this.User.Identity.Name, group.Name);
				if (memberOfGroup)
				{
					return Ok(_mapper.Map<UserGroupViewModel>(group));
				}
				else
				{
					return new ChallengeResult();
				}
			}
		}

		/// <summary>
		/// Get all user group where member
		/// </summary>
		[HttpGet]
		[Produces(typeof(List<UserGroupViewModel>))]
		public async Task<IActionResult> GetGroups()
		{
			var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy);
			IEnumerable<UserGroup> groups;
			if (viewAllUsersPolicy.Succeeded)
			{
				groups = await this._unitOfWork.UserGroups.GetAllGroupsAsync();
			}
			else
			{
				groups = await this._unitOfWork.UserGroups.GetAllGroupsWhereMemberAsync(this.User.Identity.Name);
			}
			return Ok(_mapper.Map<IEnumerable<UserGroupViewModel>>(groups));
		}

		/// <summary>
		/// Get all user groups where group admin
		/// </summary>
		[HttpGet("admin")]
		[Produces(typeof(List<UserGroupViewModel>))]
		public async Task<IActionResult> GetGroupsForAdmin()
		{
			var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy);
			IEnumerable<UserGroup> groups;
			if (viewAllUsersPolicy.Succeeded)
			{
				groups = await this._unitOfWork.UserGroups.GetAllGroupsAsync();
			}
			else
			{
				groups = await this._unitOfWork.UserGroups.GetAllGroupsForAdminAsync(this.User.Identity.Name);
			}
			return Ok(_mapper.Map<IEnumerable<UserGroupViewModel>>(groups));
		}

		/// <summary>
		/// Check if admin for one or more groups
		/// </summary>
		/// <returns></returns>
		[HttpGet("canAdmin")]
		[Produces(typeof(bool))]
		public async Task<IActionResult> CanAdminGroups()
		{
			var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy);
			IEnumerable<UserGroup> groups;
			if (viewAllUsersPolicy.Succeeded)
			{
				return Ok(true);
			}
			else
			{
				groups = await this._unitOfWork.UserGroups.GetAllGroupsForAdminAsync(this.User.Identity.Name);
				return Ok(groups.Count() > 0);
			}
		}

		/// <summary>
		/// Create user group
		/// </summary>
		[HttpPost]
		[Authorize(Authorization.Policies.ManageAllGroupsPolicy)]
		public async Task<IActionResult> CreateGroup([FromBody] UserGroupViewModel group)
		{
			if (ModelState.IsValid)
			{
				if (group == null)
				{
					return BadRequest($"{nameof(group)} cannot be null");
				}

				UserGroup appUserGroup = _mapper.Map<UserGroup>(group);
				appUserGroup.ApiKeySettings = new ApiKeys();
				await this._unitOfWork.UserGroups.AddAsync(appUserGroup);
				await this._unitOfWork.SaveChangesAsync();
				return new OkResult();
			}

			return BadRequest(ModelState);
		}

		/// <summary>
		/// Update a user group
		/// </summary>
		[HttpPut]
		[Authorize(Authorization.Policies.ManageAllGroupsPolicy)]
		public async Task<IActionResult> UpdateGroup([FromBody] UserGroupViewModel group)
		{
			if (ModelState.IsValid)
			{
				UserGroup appUserGroup = _mapper.Map<UserGroup>(group);

				this._unitOfWork.UserGroups.Update(appUserGroup);
				await this._unitOfWork.SaveChangesAsync();
				return new OkResult();
			}
			return BadRequest(ModelState);
		}


		/// <summary>
		/// Delete a user group
		/// </summary>
		[HttpDelete("{id}")]
		[Authorize(Authorization.Policies.ManageAllGroupsPolicy)]
		public async Task<IActionResult> DeleteGroup(int id)
		{
			var removed = this._unitOfWork.UserGroups.Get(id);
			this._unitOfWork.UserGroups.Remove(removed);
			await this._unitOfWork.SaveChangesAsync();
			return new OkResult();
		}

		/// <summary>
		/// Get members within group
		/// </summary>
		/// <param name="id"></param>
		/// <returns></returns>
		[HttpGet("{id}/members")]
		[Produces(typeof(List<GroupMemberViewModel>))]
		public async Task<IActionResult> GetGroupMembers(int id)
		{
			var group = await this._unitOfWork.UserGroups.GetAsync(id);
			var groupMembers = await this._unitOfWork.UserGroups.GetGroupMembersInfoAsync(id);

			if (group == null || groupMembers == null)
			{
				return BadRequest($"Group {id} does not exist");
			}
			bool canAccess = false;
			//two user types can access: superadmin or any group member
			var viewAllUsersPolicy = await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ViewAllUsersPolicy);
			if (viewAllUsersPolicy.Succeeded)
			{
				canAccess = true;
			}
			else
			{
				bool memberOfGroup = groupMembers.Where(m => m.Item1.UserName == this.User.Identity.Name).Any();
				if (memberOfGroup)
				{
					canAccess = true;
				}
			}

			if (canAccess)
			{
				List<GroupMemberViewModel> groupMembersVM = new List<GroupMemberViewModel>();

				foreach (var member in groupMembers)
				{
					var groupMemberVM = _mapper.Map<GroupMemberViewModel>(member.Item1);
					groupMemberVM.User.Roles = member.Item2;
					groupMembersVM.Add(groupMemberVM);
				}
				return Ok(groupMembersVM);
			}
			else
			{
				return new ChallengeResult();
			}
		}

		/// <summary>
		/// Adds a new member to the user group
		/// </summary>
		/// <param name="newMember"></param>
		/// <returns></returns>
		[HttpPost("members")]
		public async Task<IActionResult> AddGroupMember([FromBody] GroupMemberViewModel newMember)
		{
			if (ModelState.IsValid)
			{
				bool groupAdminHasPermission = await this.CheckGroupAdminPermission("users.managegroup");
				var isGroupAdmin = groupAdminHasPermission && await this._unitOfWork.GroupMembers.IsGroupAdminAsync(this.User.Identity.Name, newMember.Group);
				var isSuperAdmin = (await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy)).Succeeded;
				if (isGroupAdmin || isSuperAdmin)
				{
					GroupMember newGMember = _mapper.Map<GroupMember>(newMember);
					var result = this._unitOfWork.UserGroups.AddUserAsync(newGMember);
					if (result.Item1)
					{
						await this._unitOfWork.SaveChangesAsync();
						return new OkResult();
					}
					else
					{
						AddErrors(result.Item2);
					}
				}
				else
				{
					return new ChallengeResult();
				}
			}
			return BadRequest(ModelState);
		}

		/// <summary>
		/// Update member within any group. Restricted to super administrators only.
		/// </summary>
		/// <param name="member"></param>
		/// <returns></returns>
		[HttpPut("members")]
		[Authorize(Authorization.Policies.ManageAllUsersPolicy)]
		public async Task<IActionResult> UpdateGroupMember([FromBody] GroupMemberViewModel member)
		{
			GroupMember gMember = _mapper.Map<GroupMember>(member);
			var user = await this._accountManager.GetUserByIdAsync(member.User.Id);
			this._unitOfWork.GroupMembers.Update(gMember);

			if (gMember.GroupAdmin)
			{
				await this._userManager.AddToRoleAsync((TraisiUser)user, TraisiRoles.GroupAdministrator);
			}
			else
			{
				await this._userManager.RemoveFromRoleAsync((TraisiUser)user, TraisiRoles.GroupAdministrator);
			}
			await this._unitOfWork.SaveChangesAsync();
			return new OkResult();
		}

		/// <summary>
		/// Delete group member. Restricted to group admins and super admins.
		/// </summary>
		/// <param name="id"></param>
		/// <returns></returns>
		[HttpDelete("members/{id}")]
		public async Task<IActionResult> RemoveGroupMember(int id)
		{
			if (ModelState.IsValid)
			{
				bool groupAdminHasPermission = await this.CheckGroupAdminPermission("users.managegroup");
				var member = this._unitOfWork.GroupMembers.Get(id);
				if (member == null)
				{
					return BadRequest("The member does not exist.");
				}
				else
				{
					var isGroupAdmin = groupAdminHasPermission && await this._unitOfWork.GroupMembers.IsGroupAdminAsync(this.User.Identity.Name, member.Group);
					var isSuperAdmin = (await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy)).Succeeded;
					if (isGroupAdmin || isSuperAdmin)
					{
						this._unitOfWork.GroupMembers.Remove(member);
						await this._unitOfWork.SaveChangesAsync();
						return new OkResult();
					}
					else
					{
						return new ChallengeResult();
					}
				}
			}
			return BadRequest(ModelState);
		}

		/// <summary>
		/// Delete several group members
		/// </summary>
		/// <param name="ids"></param>
		/// <returns></returns>
		[HttpDelete("members")]
		public async Task<IActionResult> RemoveGroupMembers([FromQuery] int[] ids)
		{
			List<int> removalsWithErrors = new List<int>();

			if (ModelState.IsValid)
			{
				var isSuperAdmin = (await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy)).Succeeded;
				bool groupAdminHasPermission = await this.CheckGroupAdminPermission("users.managegroup");

				foreach (int id in ids)
				{
					var member = this._unitOfWork.GroupMembers.Get(id);
					if (member == null)
					{
						removalsWithErrors.Add(id);
					}
					else
					{
						if (isSuperAdmin)
						{
							this._unitOfWork.GroupMembers.Remove(member);
						}
						else
						{
							var isGroupAdmin = groupAdminHasPermission && await this._unitOfWork.GroupMembers.IsGroupAdminAsync(this.User.Identity.Name, member.Group);
							if (isGroupAdmin)
							{
								this._unitOfWork.GroupMembers.Remove(member);
							}
							else
							{
								removalsWithErrors.Add(id);
							}
						}
					}
				}
				await this._unitOfWork.SaveChangesAsync();
				if (removalsWithErrors.Count == 0)
				{
					return new OkResult();
				}
				else
				{
					if (removalsWithErrors.Count < ids.Count())
					{
						return Ok("Some members removed, but cannot delete group members: " + String.Join(",", removalsWithErrors));
					}
					else
					{
						return BadRequest("Members do not exist in groups or insufficient privileges");
					}
				}
			}
			return BadRequest(ModelState);
		}

		/// <summary>
		/// Get all email templates for given group
		/// </summary>
		/// <param name="id"></param>
		/// <returns></returns>
		[HttpGet("{id}/emailtemplates")]
		[Produces(typeof(EmailTemplateViewModel))]
		public async Task<IActionResult> GetGroupEmailTemplates(int id)
		{
			var group = await this._unitOfWork.UserGroups.GetGroupWithMembersAsync(id);

			if (await IsGroupAdmin(group.Name))
			{
				//IEnumerable<Traisi.Data.Models.Groups.EmailTemplates> emailTemplates;
				var emailTemplates = await this._unitOfWork.EmailTemplates.GetGroupEmailTemplatesAsync(id);
				return Ok(_mapper.Map<IEnumerable<EmailTemplateViewModel>>(emailTemplates));
			}
			else
			{
				return new ChallengeResult();
			}
		}

		/// <summary>
		/// Update email template
		/// </summary>
		/// <param name="emailTemplate"></param>
		/// <returns></returns>
		[HttpPut("emailtemplates")]
		public async Task<IActionResult> UpdateEmailTemplate([FromBody] EmailTemplateViewModel emailTemplate)
		{
			var group = await this._unitOfWork.UserGroups.GetGroupByNameAsync(emailTemplate.GroupName);

			if (await IsGroupAdmin(group.Name))
			{
				EmailTemplate updatedEmailTemplate = _mapper.Map<EmailTemplate>(emailTemplate);
				updatedEmailTemplate.Group = group;
				this._unitOfWork.EmailTemplates.Update(updatedEmailTemplate);
				await this._unitOfWork.SaveChangesAsync();
				return new OkResult();
			}
			else
			{
				return BadRequest("Insufficient privileges.");
			}
		}


		/// <summary>
		/// Create new email template
		/// </summary>
		/// <param name="emailTemplate"></param>
		/// <returns></returns>
		[HttpPost("emailtemplates")]
		public async Task<IActionResult> AddEmailTemplate([FromBody] EmailTemplateViewModel emailTemplate)
		{
			if (ModelState.IsValid)
			{
				var group = await this._unitOfWork.UserGroups.GetGroupByNameAsync(emailTemplate.GroupName);

				if (await IsGroupAdmin(group.Name))
				{
					EmailTemplate newEmailTemplate = _mapper.Map<EmailTemplate>(emailTemplate);
					newEmailTemplate.Group = group;
					this._unitOfWork.EmailTemplates.Add(newEmailTemplate);
					await this._unitOfWork.SaveChangesAsync();
					return new OkResult();
				}
				else
				{
					return new ChallengeResult();
				}
			}
			return BadRequest(ModelState);
		}

		/// <summary>
		/// Delete email template
		/// </summary>
		/// <param name="emailTemplate"></param>
		/// <returns></returns>
		[HttpDelete("emailtemplates/{id}")]
		public async Task<IActionResult> DeleteEmailTemplate(int id)
		{
			var emailTemplate = await this._unitOfWork.EmailTemplates.GetEmailTemplateWithGroupAsync(id);

			if (await IsGroupAdmin(emailTemplate.Group.Name))
			{
				this._unitOfWork.EmailTemplates.Remove(emailTemplate);
				await this._unitOfWork.SaveChangesAsync();
				return new OkResult();
			}
			else
			{
				return BadRequest("Insufficient privileges.");
			}
		}


		/// <summary>
		/// Get API keys for given group
		/// </summary>
		/// <param name="id"></param>
		/// <returns></returns>
		[HttpGet("{id}/apikeys")]
		[Produces(typeof(ApiKeysViewModel))]
		public async Task<IActionResult> GetGroupApiKeys(int id)
		{
			var group = await this._unitOfWork.UserGroups.GetGroupWithMembersAsync(id);
			var apiKeys = await this._unitOfWork.ApiKeys.GetGroupApiKeysAsync(id);

			if (await IsSuperAdmin() || await IsGroupAdmin(group.Name))
			{
				return Ok(_mapper.Map<ApiKeysViewModel>(apiKeys));
			}
			else
			{
				return new ChallengeResult();
			}
		}

		/// <summary>
		/// Update group API keys
		/// </summary>
		/// <param name="apiKeys"></param>
		/// <returns></returns>
		[HttpPut("{id}/apikeys")]
		public async Task<IActionResult> UpdateGroupApiKeys([FromBody] ApiKeysViewModel apiKeys)
		{
			var group = await this._unitOfWork.UserGroups.GetAsync(apiKeys.GroupId);
			if (await IsSuperAdmin() || await IsGroupAdmin(group.Name))
			{
				ApiKeys gApiKeys = _mapper.Map<ApiKeys>(apiKeys);
				gApiKeys.Group = group;
				this._unitOfWork.ApiKeys.Update(gApiKeys);
				await this._unitOfWork.SaveChangesAsync();
				return new OkResult();
			}
			else
			{
				return BadRequest("Insufficient privileges.");
			}
		}

		/// <summary>
		/// Check if user is super admin
		/// </summary>
		/// <param name="User"></param>
		/// <returns></returns>
		private async Task<bool> IsSuperAdmin()
		{
			var isSuperAdmin = (await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy)).Succeeded;
			return isSuperAdmin;
		}


		/// <summary>
		/// Check if user is group admin
		/// </summary>
		/// <param name="groupName"></param>
		/// <returns></returns>
		private async Task<bool> IsGroupAdmin(string groupName)
		{
			var isGroupAdmin = await this._unitOfWork.GroupMembers.IsGroupAdminAsync(this.User.Identity.Name, groupName);
			return isGroupAdmin;
		}

		/// <summary>
		/// Check if group admin has given permission
		/// </summary>
		/// <param name="permission"></param>
		/// <returns></returns>
		private async Task<bool> CheckGroupAdminPermission(string permission)
		{
			var role = await _accountManager.GetRoleLoadRelatedAsync("group administrator");
			var hasPermission = (from r in role.Claims
								 where r.ClaimValue == permission
								 select r).Any();
			return hasPermission;
		}

		private void AddErrors(IEnumerable<string> errors)
		{
			foreach (var error in errors)
			{
				ModelState.AddModelError(string.Empty, error);
			}
		}

	}
}
