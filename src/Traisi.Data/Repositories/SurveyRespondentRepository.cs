using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace Traisi.Data.Repositories
{
    public class SurveyRespondentRepository : Repository<SurveyRespondent>, ISurveyRespondentRepository
    {
        public SurveyRespondentRepository(DbContext context) : base(context)
        {

        }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<PrimaryRespondent> GetPrimaryRespondentForUserAsync(ApplicationUser user)
        {
            var respondent = await this._appContext.PrimaryRespondents.Where(r => r.User == user)
            .Include(s => s.SurveyRespondentGroup)
            .ThenInclude(s => s.GroupMembers)
            .Include(s => s.Shortcode)
            .FirstOrDefaultAsync();

            if (respondent == null)
            {
                return await this.CreatePrimaryResponentForUserAsnyc(user);
            }
            else
            {
                return respondent;
            }
        }

        public async Task<SurveyRespondent> GetSurveyRespondentAsync(int respondentId)
        {
            var respondent = await this._appContext.PrimaryRespondents.Where(r => r.Id == respondentId)
            .Include(s => s.SurveyRespondentGroup)
            .ThenInclude(s => s.GroupMembers)
            .Include(s => s.Shortcode)
            .Include(s => s.SurveyAccessRecords)
            .Include( s => s.Survey)
            .FirstOrDefaultAsync();

            if (respondent == null)
            {
                return await this.GetSubRespondentAsync(respondentId);
            }
            else
            {

                return respondent;
            }
        }



        /// <summary>
        /// 
        /// </summary>
        /// <param name="respondentId"></param>
        /// <returns></returns>
        public async Task<SurveyRespondent> GetSubRespondentAsync(int respondentId)
        {
            return await this._appContext.SurveyRespondents.Where(r => r.Id == respondentId)
            .Include(s => s.SurveyRespondentGroup)
            .ThenInclude(s => s.GroupMembers)
            .ThenInclude(s => ((SubRespondent)s).PrimaryRespondent).ThenInclude(s => s.SurveyAccessRecords)
            .FirstOrDefaultAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<PrimaryRespondent> CreatePrimaryResponentForUserAsnyc(ApplicationUser user)
        {
            PrimaryRespondent respondent = new PrimaryRespondent()
            {
                User = user,
                SurveyRespondentGroup = new SurveyRespondentGroup(),
            };

            if (user is SurveyUser surveyUser)
            {
                surveyUser.PrimaryRespondent = respondent;

            }
            this._entities.Add(respondent);
            await this._appContext.SaveChangesAsync();

            return respondent;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        public async Task<PrimaryRespondent> GetPrimaryRespondentForSurveyAsync(Survey survey)
        {
            var respondent = await this._appContext.PrimaryRespondents.Where(p => p.Survey == survey)
            .FirstOrDefaultAsync();
            return respondent;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="survey"></param>
        /// <returns></returns>
        public async Task<PrimaryRespondent> GetPrimaryRespondentForSurveyAndTraisiUserAsync(TraisiUser user, Survey survey)
        {
            var respondent = await this._appContext.PrimaryRespondents.Where(p => p.Survey == survey && p.User == user)
           .FirstOrDefaultAsync();
            return respondent;
        }


    }
}