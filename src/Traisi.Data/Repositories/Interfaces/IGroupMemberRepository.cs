using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;

namespace Traisi.Data.Repositories.Interfaces
{
	public interface IGroupMemberRepository : IRepository<GroupMember>
	{
		Task<GroupMember> GetMemberWithInfoAsync(int id);
		Task<bool> IsMemberOfGroupAsync(string username, string groupName);
		Task<bool> IsGroupAdminAsync (string username, string groupName);
	}
}