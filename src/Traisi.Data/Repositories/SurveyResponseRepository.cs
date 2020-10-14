using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.EntityFrameworkCore.Internal;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Sdk.Enums;

namespace Traisi.Data.Repositories
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
        public async Task<List<SurveyResponse>> ListQuestionResponsesForRespondentAsync(int respondentId, string shortcode) => await this._appContext.SurveyResponses.Where(s => s.Respondent.Id == respondentId).ToListAsync();

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="questionName"></param>
        /// <returns></returns>
        public async Task<SurveyResponse> GetQuestionResponeByQuestionName(SurveyRespondent user, string questionName) => await this._entities.Where(u => u.Respondent == user)
                .Include(r => ((SurveyUser)r.SurveyAccessRecord.AccessUser).PrimaryRespondent.SurveyAccessRecords)
                .Include(s => s.ResponseValues).ThenInclude(s => s.SurveyResponse)
                .Where(q => q.QuestionPart.Name.ToLower() == questionName.ToLower())
                .Where(r => r.SurveyAccessRecord == ((SurveyUser)r.SurveyAccessRecord.AccessUser).PrimaryRespondent.SurveyAccessRecords.OrderByDescending(o => o.AccessDateTime))
                .FirstOrDefaultAsync();

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
        public async Task<List<SurveyResponse>> ListSurveyResponsesForRespondentByTypeAsync(int surveyId, SurveyRespondent user, QuestionResponseType type)
        {

            var r3 = ((PrimaryRespondent)user).SurveyAccessRecords;

            // var records = this._appContext.SurveyAccessRecords.Where (r => r.AccessUser == ((PrimaryRespondent) user).User).ToListAsync ();

            var responses = new List<SurveyResponse>();
            IQueryable<SurveyResponse> query = this._appContext.SurveyResponses.Where(r => r.QuestionPart.Survey.Id == surveyId)
                .Distinct()
                .Where(r => user.SurveyRespondentGroup.GroupMembers.AsEnumerable().Contains(r.Respondent))
                .Include(r => r.ResponseValues)
                .Include(r => r.Respondent)
                .Include(r => r.SurveyAccessRecord.Respondent.SurveyAccessRecords);

            if (type == QuestionResponseType.Location)
            {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == (int)ResponseTypes.LocationResponse));
            }
            else if (type == QuestionResponseType.Timeline)
            {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == (int)ResponseTypes.TimelineResponse));

            }
            else if (type == QuestionResponseType.OptionSelect)
            {
                query = query.Where(r => r.ResponseValues.Any(r2 => EF.Property<int>(r2, "ResponseType") == (int)ResponseTypes.OptionSelectResponse));

            }

            query = query.OrderByDescending(r => r.SurveyAccessRecord.AccessDateTime);

            /*else if (type == "string") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 1));
			} else if (type == "decimal") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 2));
			} else if (type == "integer") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 3));
			} else if (type == "optionlist") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 4));
			} else if (type == "json") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 6));
			} else if (type == "datetime") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 8));
			} else if (type == "option-select") {
				query = query.Where (r => r.ResponseValues.Any (r2 => EF.Property<int> (r2, "ResponseType") == 8));
			}*/

            //query = query.GroupBy (r => r.QuestionPart).Select (
            //	r => r.OrderByDescending (p => p.UpdatedDate).First ()
            // ).Include (r => r.ResponseValues).Include (r => r.Respondent);

            // query = query.OrderByDescending (r => r.UpdatedDate);

            var result = await query.ToListAsync();

            var filtered = result.Where(r => r.SurveyAccessRecord.AccessDateTime == result.Max(r => r.SurveyAccessRecord.AccessDateTime)).ToList();

            // foreach (var r in result)
            // {
            //    responses.Add(r);
            // }
            // TO DO FIX THIS RETURN
            // return new List<SurveyResponse>();
            return filtered;
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
            if (user is SubRespondent subRespondent)
            {
                var result = await this._entities.Where(s => s.Respondent == user && s.QuestionPart.Id == questionId && s.Repeat == repeat)
                    .Include(v => v.ResponseValues)
                    .Include(v => v.QuestionPart).ThenInclude(q => q.QuestionConfigurations)
                    .Include(v => v.Respondent).ThenInclude(v => ((SubRespondent)v).PrimaryRespondent).ThenInclude(s => s.SurveyAccessRecords)
                    .Include(v => v.Respondent).ThenInclude(v => v.SurveyRespondentGroup).ThenInclude(v => v.GroupPrimaryRespondent)
                    .Include(v => v.SurveyAccessRecord).OrderByDescending(s => s.UpdatedDate).FirstOrDefaultAsync();
                return result;
            }
            else if (user is PrimaryRespondent primaryRespondent)
            {
                return await this._entities.Where(s => s.Respondent == user && s.QuestionPart.Id == questionId && s.Repeat == repeat)
                   .Include(v => v.ResponseValues)
                   .Include(v => v.QuestionPart).ThenInclude(q => q.QuestionConfigurations)
                   .Include(v => v.Respondent).ThenInclude(v => ((PrimaryRespondent)v).SurveyAccessRecords)
                   .Include(v => v.Respondent).ThenInclude(v => v.SurveyRespondentGroup).ThenInclude(v => v.GroupPrimaryRespondent)
                   .Include(v => v.SurveyAccessRecord).OrderByDescending(s => s.UpdatedDate).FirstOrDefaultAsync();

            }
            else
            {
                return null;
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> GetMostRecentResponseNoValuesForQuestionByRespondentAsync(Survey survey, int[] questionIds, SurveyRespondent user)
        {
            if (user is SubRespondent subRespondent)
            {
                var result = await this._entities.Where(s => s.Respondent == user && questionIds.AsEnumerable().Contains(s.QuestionPart.Id))
                    ///.Include(v => v.Respondent).ThenInclude(v => ((SubRespondent)v).PrimaryRespondent).ThenInclude(s => s.SurveyAccessRecords)
                    ///.Include(v => v.Respondent).ThenInclude(v => v.SurveyRespondentGroup).ThenInclude(v => v.GroupPrimaryRespondent) 
                    .Include(v => v.SurveyAccessRecord).OrderByDescending(s => s.UpdatedDate).ToListAsync();
                return result;
            }
            else if (user is PrimaryRespondent primaryRespondent)
            {
                return await this._entities.Where(s => s.Respondent == user && questionIds.AsEnumerable().Contains(s.QuestionPart.Id))
                   ///.Include(v => v.Respondent).ThenInclude(v => ((PrimaryRespondent)v).SurveyAccessRecords)
                   //.Include(v => v.Respondent).ThenInclude(v => v.SurveyRespondentGroup).ThenInclude(v => v.GroupPrimaryRespondent)
                   .Include(v => v.SurveyAccessRecord).OrderByDescending(s => s.UpdatedDate).ToListAsync();

            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsAsync(List<int> questionIds, SurveyRespondent user)
        {
            var r1 = await this._entities.Where(s => s.Respondent == user &&
            questionIds.AsEnumerable().Contains(s.QuestionPart.Id))
                .Include(v => v.ResponseValues)
                .Include(v => v.QuestionPart)
                .Include(v => v.SurveyAccessRecord).ToListAsync();
            var result = r1.GroupBy(x => x.QuestionPart.Id, (key, g) => g.OrderByDescending(e => e.SurveyAccessRecord.AccessDateTime).FirstOrDefault()).ToList();
            // result.ForEach(r => r.QuestionPart = null);
            return result;
        }

        /// <summary>
        /// Returns a list of latest responses by the passed question part id, for all associated respondents.
        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="users"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>> ListSurveyResponsesForQuestionsAsync(List<int> questionIds, List<int> users)
        {
            var r1 = await this._entities.Where(s => users.AsEnumerable().Contains(s.Respondent.Id) && s.Excluded == false &&
         questionIds.AsEnumerable().Contains(s.QuestionPart.Id))
             .Include(v => v.ResponseValues)
             .Include(v => v.QuestionPart)
             .Include(v => v.SurveyAccessRecord).ToListAsync();
            var result = r1.GroupBy(x => new { RespondentId = x.Respondent.Id, QuestionId = x.QuestionPart.Id }, (key, g) => g.OrderByDescending(e => e.SurveyAccessRecord.AccessDateTime).FirstOrDefault()).ToList();
            // result.ForEach(r => r.QuestionPart = null);
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

            var result = await this._entities.Where(s => s.Respondent == user && s.Excluded == false && questionNames.Contains(s.QuestionPart.Name))
                .Include(v => v.ResponseValues).Include(v => v.QuestionPart).OrderBy(s => questionNames.IndexOf(s.QuestionPart.Name)).ThenByDescending(s => s.UpdatedDate).ToListAsync();
            //.ToAsyncEnumerable ().OrderBy (s => questionNames.IndexOf (s.QuestionPart.Name)).ThenByDescending (s => s.UpdatedDate).ToList ();

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

            var result = await this._entities.Where(s => s.Respondent == user && s.Excluded == false && questionNames.Contains(s.QuestionPart.Name)).OrderByDescending(s => s.UpdatedDate)
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

        /// <summary>
        /// Deletes all responses for a user -- as well as any responses for household members.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        public async Task<bool> DeleteAllResponsesForUser(SurveyRespondent user, int surveyId)
        {
            this._entities.RemoveRange(_entities.Where(x => x.Respondent == user && x.QuestionPart.Survey.Id == surveyId));
            // this._entities.RemoveRange(_entities.Where(x => user.SurveyRespondentGroup.GroupMembers.Any(r => r == user)));
            await this._appContext.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<int>> ListQuestionIdsForCompletedResponses(int surveyId, SurveyRespondent respondent)
        {
            return await this._entities.Where(r => r.Respondent.Id == respondent.Id && r.Excluded == false
            && r.QuestionPart.SurveyId == surveyId).Select(r => r.QuestionPart.Id).ToListAsync();
        }
    }

}