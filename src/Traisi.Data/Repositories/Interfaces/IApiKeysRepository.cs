using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;

namespace Traisi.Data.Repositories.Interfaces
{
	public interface IApiKeysRepository : IRepository<ApiKeys>
	{
		Task<ApiKeys> GetGroupApiKeysAsync(int groupId);
	}
}