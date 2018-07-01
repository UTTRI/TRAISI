// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.Groups;

namespace DAL.Repositories.Interfaces
{
	public interface IApiKeysRepository : IRepository<ApiKeys>
	{
		Task<ApiKeys> GetGroupApiKeysAsync(int groupId);
	}
}