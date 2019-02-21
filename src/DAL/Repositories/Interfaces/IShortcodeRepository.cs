using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.Surveys;

namespace DAL.Repositories.Interfaces
{
	public interface IShortcodeRepository : IRepository<Shortcode>
	{
		Task<IEnumerable<Shortcode>> GetShortcodesForSurveyAsync(int surveyId, bool isTest, int pageIndex, int pageSize);

		IEnumerable<Shortcode> GetShortcodesForSurvey(int surveyId, bool isTest);

		Task<Shortcode> GetShortcodeForSurveyAsync(Survey survey, string code);

		Task<int> GetCountOfShortcodesForSurveyAsync(int surveyId, bool isTest);

		bool UniqueShortCodeForSurvey(int surveyId, string code);
		IEnumerable<string> GetUniqueCodes(int surveyId, IEnumerable<string> codesToCheck);

	}
}