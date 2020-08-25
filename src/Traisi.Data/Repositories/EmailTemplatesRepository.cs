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
	public class EmailTemplatesRepository : Repository<EmailTemplate>, IEmailTemplateRepository
	{
		public EmailTemplatesRepository(ApplicationDbContext context) : base(context)
		{ }

		private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

		/// <summary>
		/// Gets all email templates for a given group
		/// </summary>
		/// <param name="groupId"></param>
		/// <returns></returns>
		public async Task<IEnumerable<EmailTemplate>> GetGroupEmailTemplatesAsync(int groupId)
		{
			return await _appContext.EmailTemplates
					.Where(s => s.Group.Id == groupId)
					.ToListAsync();
		}

        public async Task<EmailTemplate> GetEmailTemplateWithGroupAsync(int templateId)
        {
            return await _appContext.EmailTemplates
                .Where(e => e.Id == templateId)
                .Include(e => e.Group)
                .SingleOrDefaultAsync();
        }

    }
}
