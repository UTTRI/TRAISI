using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Repositories.Interfaces
{
	public interface ISiteSurveyTemplateRepository : IRepository<SiteSurveyTemplate>
	{
		Task<IEnumerable<SiteSurveyTemplate>> GetSiteSurveyTemplatesAsync();
	}
}