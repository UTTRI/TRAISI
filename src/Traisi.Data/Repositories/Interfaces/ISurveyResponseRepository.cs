using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Enums;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface ISurveyResponseRepository : IRepository<SurveyResponse>
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> ListQuestionResponsesForRespondentAsync(int questionId, string shortcode);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="questionName"></param>
        /// <returns></returns>
        Task<SurveyResponse> GetQuestionResponeByQuestionName(SurveyRespondent user, string questionName);


        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> ListMostRecentQuestionResponsesForRespondentAsync(int surveyId, SurveyRespondent user);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="user"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> ListSurveyResponsesForRespondentByTypeAsync(int surveyId, SurveyRespondent user, QuestionResponseType responseType);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<SurveyResponse> GetMostRecentResponseForQuestionByRespondentAsync(int questionId, SurveyRespondent user, int repeat);
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <param name="user"></param>
        /// <param name="repeat"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> GetMostRecentResponseNoValuesForQuestionByRespondentAsync(Survey survey, int[] questionIds, SurveyRespondent user);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsAsync(List<int> questionIds, SurveyRespondent user);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsAsync(List<int> questionIds, List<int> users);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionNames"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsByNameAsync(List<string> questionNames, SurveyRespondent user);

        Task<List<SurveyResponse>> ListMostRecentSurveyResponsesForQuestionsByNameAsync(List<string> questionNames, SurveyRespondent user);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        Task<List<int>> ListQuestionIdsForCompletedResponses(int surveyId, SurveyRespondent respondent);



        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        Task<bool> DeleteAllResponsesForUser(SurveyRespondent user, int surveyId);
    }
}