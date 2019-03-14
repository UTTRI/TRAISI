using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.ResponseTypes;
using DAL.Models.Surveys;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class SurveyResponseRepository : Repository<SurveyResponse>, ISurveyResponseRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;


        public SurveyResponseRepository(DbContext context) : base(context) { }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListQuestionResponsesForRespondentAsync(int respondentId, string shortcode)
        {
            return await this._entities.Where(s => s.Respondent.Id == respondentId).ToListAsync();
        }




        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="questionName"></param>
        /// <returns></returns>
        public async Task<SurveyResponse> GetQuestionResponeByQuestionName(SurveyRespondent user, string questionName)
        {
            return await this._entities.Where(u => u.Respondent == user)
                .Where(q => q.QuestionPart.Name.ToLower() == questionName.ToLower())
                .Include(s => s.ResponseValues).ThenInclude(s => s.SurveyResponse).FirstOrDefaultAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListMostRecentQuestionResponsesForRespondentAsync(int surveyId,
            SurveyRespondent user)
        {
            var result = await this._entities
                .Where(r => r.QuestionPart.SurveyId == surveyId && r.Respondent == user)
                .ToListAsync();

            return result;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="user"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListSurveyResponsesForRespondentByTypeAsync(int surveyId, SurveyRespondent user, string type)
        {

            var responses = new List<SurveyResponse>();
            IQueryable<SurveyResponse> query = this._appContext.SurveyResponses.Where(r => r.QuestionPart.Survey.Id == surveyId)
            .Distinct()
            .Where(r => user.SurveyRespondentGroup.GroupMembers.Contains(r.Respondent))
            .Include(r => r.ResponseValues)
            .Include(r => r.Respondent)
            .Include(r => r.QuestionPart).ThenInclude(q => q.QuestionConfigurations);

            if (type == "location") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 3));
            }
            else if (type == "timeline") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 7));
            }
            else if (type == "string") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 1));
            }
            else if (type == "decimal") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 2));
            }
            else if (type == "integer") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 3));
            }
            else if (type == "optionlist") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 4));
            }
            else if (type == "json") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 6));
            }
            else if (type == "datetime") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 8));
            }
            else if (type == "option-select") {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == 8));
            }
            var result = await query.ToListAsync();

            foreach (var r in result) {
                responses.Add(r);
            }


            return responses;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<SurveyResponse> GetMostRecentResponseForQuestionByRespondentAsync(int questionId,
            SurveyRespondent user, int repeat)
        {
            var result = await this._entities.Where(s => s.Respondent == user && s.QuestionPart.Id == questionId && s.Repeat == repeat)
            .Include(v => v.ResponseValues)
                .ToAsyncEnumerable().OrderByDescending(s => s.UpdatedDate).FirstOrDefault();

            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsAsync(List<int> questionIds, SurveyRespondent user)
        {

            var result = await this._entities.Where(s => s.Respondent == user && questionIds.Contains(s.QuestionPart.Id))
            .Include(v => v.ResponseValues).Include(v => v.QuestionPart)
                .ToAsyncEnumerable().OrderBy(s => questionIds.IndexOf(s.QuestionPart.Id)).ThenByDescending(s => s.UpdatedDate).ToList();

            result.ForEach(r => r.QuestionPart = null);
            return result;
        }

        /// <summary>
        ///     
        /// </summary>
        /// <param name="questionNames"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsByNameAsync(List<string> questionNames, SurveyRespondent user)
        {

            var result = await this._entities.Where(s => s.Respondent == user && questionNames.Contains(s.QuestionPart.Name))
            .Include(v => v.ResponseValues).Include(v => v.QuestionPart)
                .ToAsyncEnumerable().OrderBy(s => questionNames.IndexOf(s.QuestionPart.Name)).ThenByDescending(s => s.UpdatedDate).ToList();

            result.ForEach(r => r.QuestionPart = null);
            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionNames"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListMostRecentSurveyResponsesForQuestionsByNameAsync(List<string> questionNames, SurveyRespondent user)
        {

            var result = await this._entities.Where(s => s.Respondent == user && questionNames.Contains(s.QuestionPart.Name)).OrderByDescending(s => s.UpdatedDate)
            .Include(v => v.ResponseValues).Include(v => v.QuestionPart).
            GroupBy(s => s.QuestionPart).
            Select(
                r => new
                {
                    Response = r.OrderByDescending(t => t.UpdatedDate).First()
                })
                .Select(r => r.Response)
            .ToListAsync();
            return result;
        }

        public async Task<bool> DeleteAllResponsesForUser(SurveyRespondent user, int surveyId)
        {
            this._entities.RemoveRange(_entities.Where(x => x.Respondent == user && x.QuestionPart.Survey.Id == surveyId));

            await this._appContext.SaveChangesAsync();

            return true;
        }
    }

}