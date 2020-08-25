using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Groups;

namespace Traisi.Data.Repositories.Interfaces
{
	public interface IEmailTemplateRepository : IRepository<EmailTemplate>
	{
		Task<IEnumerable<EmailTemplate>> GetGroupEmailTemplatesAsync(int groupId);

        Task<EmailTemplate> GetEmailTemplateWithGroupAsync(int templateId);
	}
}