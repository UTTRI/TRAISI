using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Traisi.Data.Core;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Traisi.ViewModels;
using Traisi.ViewModels.SurveyViewer;
using Traisi.Models.ViewModels;

namespace Traisi.Services.Interfaces
{
    public interface ISurveyViewerService
    {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        Task<bool> SurveyLogin(Survey survey, string shortcode, ClaimsPrincipal currentUser);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="groupcode"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<bool> SurveyGroupcodeLogin(Survey surveyId,
            string groupcode, ClaimsPrincipal user, string userAgent, JObject queryParams, IHttpContextAccessor accessor);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <returns></returns>
        Task<List<QuestionOption>> GetQuestionOptions(int questionId);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        Task<SurveyView> GetDefaultSurveyView(int surveyId);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <returns></returns>
        SurveyView GetDefaultSurveyView(Survey survey);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        bool AuthorizeSurveyUser(Survey survey, string shortcode);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        Task<SurveyStartViewModel> GetSurveyWelcomeView(string name);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>
        Task<Survey> GetSurveyFromCode(string code);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="language"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        Task<SurveyViewTermsAndConditionsViewModel> GetSurveyTermsAndConditionsText(int surveyId,
            string language = null,
            SurveyViewType viewType = SurveyViewType.CatiView);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="language"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        Task<SurveyViewThankYouViewModel> GetSurveyThankYouText(int surveyId,
            string language = null,
            SurveyViewType viewType = SurveyViewType.CatiView);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewType"></param>
        /// <param name="pageNumber"></param>
        /// <returns></returns>
        Task<QuestionPartView> GetSurveyViewPageQuestions(int surveyId, SurveyViewType viewType, int pageNumber);

        /// <summary>
        /// Returns the list of top level question part views (pages) for a particular survey view.
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewType"></param>
        /// <param name="pageNumber"></param>
        /// <returns></returns>
        Task<List<QuestionPartView>> GetSurveyViewPages(int surveyId, SurveyViewType viewType);

        Task<string> GetSurveySuccessLink(ApplicationUser user, Survey survey);

    }
}