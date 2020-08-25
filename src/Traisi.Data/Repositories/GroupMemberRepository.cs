using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Traisi.Data.Repositories {
	public class GroupMemberRepository : Repository<GroupMember>, IGroupMemberRepository {
		public GroupMemberRepository (ApplicationDbContext context) : base (context) { }

		private ApplicationDbContext _appContext => (ApplicationDbContext) _context;

		public async Task<GroupMember> GetMemberWithInfoAsync(int id)
		{
			return await _appContext.GroupMembers
			.Where(gm => gm.Id == id)
			.Include(gm => gm.UserGroup)
			.Include(gm => gm.User)
			.SingleOrDefaultAsync();
		}

		/// <summary>
		/// Check if member within given group
		/// </summary>
		/// <param name="username"></param>
		/// <param name="groupName"></param>
		/// <returns></returns>
		public async Task<bool> IsMemberOfGroupAsync(string username, string groupName)
		{
			int number = await _appContext.GroupMembers
				.Where(gm => gm.UserName == username && gm.Group == groupName)
				.CountAsync();
			
			return number == 1;
		}

		public async Task<bool> IsGroupAdminAsync (string username, string groupName)
		{
			int number = await _appContext.GroupMembers
				.Where(gm => gm.UserName == username && gm.Group == groupName && gm.GroupAdmin)
				.CountAsync();
			
			return number == 1;
		}
	}
}