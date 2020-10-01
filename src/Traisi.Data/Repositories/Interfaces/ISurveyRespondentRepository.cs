using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Repositories.Interfaces
{
	public interface ISurveyRespondentRepository : IRepository<SurveyRespondent>
	{

		Task<PrimaryRespondent> GetPrimaryRespondentForUserAsync(ApplicationUser user);

		Task<SurveyRespondent> GetSubRespondentAsync(int respondentId);

		Task<PrimaryRespondent> CreatePrimaryResponentForUserAsnyc(ApplicationUser user);

		Task<PrimaryRespondent> GetPrimaryRespondentForSurveyAsync(Survey survey);

		Task<SurveyRespondent> GetSurveyRespondentAsync(int respondentId);

		Task<PrimaryRespondent> GetPrimaryRespondentForSurveyAndTraisiUserAsync(ApplicationUser user, Survey survey);

		

	}
}