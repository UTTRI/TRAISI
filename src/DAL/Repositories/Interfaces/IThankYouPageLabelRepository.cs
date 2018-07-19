using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.Surveys;

namespace DAL.Repositories.Interfaces
{
	public interface IThankYouPageLabelRepository : IRepository<ThankYouPageLabel>
	{
			Task<ThankYouPageLabel> GetThankYouPageLabelAsync(string surveyViewName, string language = null);
	}
}