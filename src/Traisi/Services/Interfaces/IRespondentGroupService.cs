using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.Services.Interfaces
{
    public interface IRespondentGroupService
    {

		/// <summary>
		/// Add the list of respondents to the respondent group
		/// </summary>
		/// <param name="group"></param>
		/// <param name="respondents"></param>
        void AddRespondentGroupMembers(SurveyRespondentGroup group, List<SubRespondent> respondents);


		/// <summary>
		/// 
		/// </summary>
		/// <param name="group"></param>
		/// <param name="respondent"></param>
		Task AddRespondent(SurveyRespondentGroup group, SubRespondent respondent);


		/// <summary>
		/// 
		/// </summary>
		/// <param name="group"></param>
		/// <param name="respondent"></param>
		Task RemoveRespondent(SurveyRespondentGroup group, SurveyRespondent respondent);

		/// <summary>
		/// 
		/// </summary>
		/// <param name="model"></param>
		Task<bool> UpdateRespondent(SurveyRespondentViewModel model, ApplicationUser user);

		/// <summary>
		/// 
		/// </summary>
		/// <param name="user"></param>
		/// <returns></returns>
		Task<SurveyRespondentGroup> GetSurveyRespondentGroupForUser(ApplicationUser user);

		

    }
}