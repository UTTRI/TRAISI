using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace Traisi.Data.Repositories
{
	public class SiteSurveyTemplateRepository : Repository<SiteSurveyTemplate>, ISiteSurveyTemplateRepository
	{
		public SiteSurveyTemplateRepository(ApplicationDbContext context) : base(context)
		{ }

		private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

		/// <summary>
		/// Gets all site survey templates
		/// </summary>
		/// <returns></returns>
		public async Task<IEnumerable<SiteSurveyTemplate>> GetSiteSurveyTemplatesAsync()
		{
			return await _appContext.SiteSurveyTemplates
					.ToListAsync();
		}

    }
}
