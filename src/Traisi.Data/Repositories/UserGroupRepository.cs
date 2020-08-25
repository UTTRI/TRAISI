using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;
using Traisi.Data.Repositories.Interfaces;

namespace Traisi.Data.Repositories
{
	public class UserGroupRepository : Repository<UserGroup>, IUserGroupRepository
	{
		public UserGroupRepository(ApplicationDbContext context) : base(context)
		{ }

		private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

		/// <summary>
		/// Add user to survey group
		/// </summary>
		/// <param name="newMember">GroupMember object with Group variable populated</param>
		public Tuple<bool, string[]> AddUserAsync(GroupMember newMember)
		{
			Tuple<bool, string[]> result;
			try
			{
				newMember.User = _appContext.Users.Single(r => r.UserName == newMember.UserName);
				var group = _appContext.UserGroups
						.Where(g => g.Name == newMember.Group)
						.Include(g => g.Members)
						.Single();
				newMember.UserGroup = group;
				if (group.Members == null)
				{
					group.Members = new List<GroupMember>();
				}
				if (group.Members.Where(m => m.UserName == newMember.UserName).Count() == 0)
				{
					group.Members.Add(newMember);
				}
				else
				{
					throw new Exception("Member " + newMember.UserName + " already exists in group: " + group.Name);
				}
				result = Tuple.Create(true, new string[] { "Success" });
			}
			catch (Exception ex)
			{
				result = Tuple.Create(false, new string[] { ex.Message });
			}
			return result;
		}

		/// <summary>
		/// Get group information for a given group
		/// </summary>
		/// <param name="id"></param>
		/// <returns></returns>
		public async Task<UserGroup> GetGroupWithMembersAsync(int id)
		{
			return await _appContext.UserGroups
				.Where(m => m.Id == id)
				.Include(m => m.Members)
				.SingleAsync();
		}

		/// <summary>
		/// Get list of groups where member
		/// </summary>
		/// <param name="username"></param>
		/// <returns></returns>
		public async Task<IEnumerable<UserGroup>> GetAllGroupsWhereMemberAsync(string username)
		{
			return await _appContext.GroupMembers
					.Where(m => m.UserName == username)
					.Include(m => m.UserGroup)
					.Select(m => m.UserGroup)
					.OrderBy(g => g.Name)
					.ToListAsync();
		}

		/// <summary>
		/// Get list of groups where group admin
		/// </summary>
		/// <param name="username"></param>
		/// <returns></returns>
		public async Task<IEnumerable<UserGroup>> GetAllGroupsForAdminAsync(string username)
		{
			return await _appContext.GroupMembers
					.Where(m => m.UserName == username && m.GroupAdmin)
					.Include(m => m.UserGroup)
					.Select(m => m.UserGroup)
					.OrderBy(g => g.Name)
					.ToListAsync();
		}

		/// <summary>
		/// Get all groups in platform
		/// </summary>
		/// <returns></returns>
		public async Task<IEnumerable<UserGroup>> GetAllGroupsAsync()
		{
			return await _appContext.UserGroups
					.OrderBy(c => c.Name)
					.ToListAsync();
		}

		/// <summary>
		/// Gets the group members information for a given group.
		/// Returns roles for each member as mapper ignores roles.
		/// </summary>
		/// <param name="groupID"></param>
		/// <returns></returns>
		public async Task<IEnumerable<Tuple<GroupMember, string[]>>> GetGroupMembersInfoAsync(int groupID)
		{
			var group = await _appContext.UserGroups
					.Where(g => g.Id == groupID)
					.Include(g => g.Members).ThenInclude(m => m.User).ThenInclude(u => u.Roles)
					.OrderBy(g => g.Name)
					.SingleOrDefaultAsync();

			var roleDict = _appContext.Roles.ToDictionary(r => r.Id, r => r.Name);

			return group?.Members.Select(m => Tuple.Create(m, m.User.Roles.Select(r => roleDict[r.RoleId]).ToArray())).ToList();
		}

		/// <summary>
		/// Get group info given group's name
		/// </summary>
		/// <param name="groupName"></param>
		/// <returns></returns>
		public async Task<UserGroup> GetGroupByNameAsync(string groupName)
		{
			return await _appContext.UserGroups
				.Where(g => g.Name == groupName)
				.SingleOrDefaultAsync();
		}
	}
}
