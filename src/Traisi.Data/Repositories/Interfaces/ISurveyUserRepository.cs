using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Repositories.Interfaces
{
	public interface ISurveyUserRepository : IRepository<SurveyUser>
	{
		/// <summary>
		/// 
		/// </summary>
		/// <param name="survey"></param>
		/// <param name="shortcode"></param>
		/// <returns></returns>
		Task<SurveyUser> GetSurveyUserAsync(Survey survey, string shortcode);

		Task<SurveyUser> GetSurveyUserAsync(int surveyId, string shortcode);
	}
}