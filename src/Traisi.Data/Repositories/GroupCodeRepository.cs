using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.IO;


namespace Traisi.Data.Repositories
{
    public class GroupcodeRepository : Repository<Groupcode>, IGroupcodeRepository
    {
        public GroupcodeRepository(ApplicationDbContext context) : base(context) { }

        public GroupcodeRepository(DbContext context) : base(context) { }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        /// <summary>
        /// Get all groupcodes for survey (with paging)
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="isTest"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Groupcode>> GetGroupCodesForSurveyAsync(int surveyId, bool isTest, int pageIndex, int pageSize)
        {
            IQueryable<Groupcode> codes = _appContext.Groupcodes
                            .Where(s => s.Survey.Id == surveyId && s.IsTest == isTest)
                            .OrderByDescending(sc => sc.CreatedDate);

            if (pageIndex > 0) {
                codes = codes.Skip(pageIndex * pageSize);
            }
            if (pageSize > 0) {
                codes = codes.Take(pageSize);
            }
            return await codes.ToListAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="groupcode"></param>
        /// <returns></returns>
        public async Task<Groupcode> GetGroupcodeForSurvey(Survey survey, string groupcode)
        {
            return await _appContext.Groupcodes.Where(gc => gc.Code == groupcode)
            .Where(gc => gc.Survey == survey)
            .Include(gc => gc.Survey).FirstOrDefaultAsync();
        }


        /// <summary>
        /// Get all groupcodes for survey
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="isTest"></param>
        /// <returns></returns>
        public IEnumerable<Groupcode> GetGroupCodesForSurvey(int surveyId, bool isTest)
        {
            return _appContext.Groupcodes
                            .Where(s => s.Survey.Id == surveyId && s.IsTest == isTest)
                            .OrderByDescending(sc => sc.CreatedDate)
                            .ToList();
        }

        public async Task<int> GetCountOfGroupCodesForSurveyAsync(int surveyId, bool isTest)
        {
            return await _appContext.Groupcodes
            .Where(s => s.Survey.Id == surveyId && s.IsTest == isTest)
            .CountAsync();
        }

        /// <summary>
        /// Check if group code in given survey is unique
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="code"></param>
        /// <returns></returns>
        public bool IsUniqueGroupCodeForSurvey(int surveyId, string code)
        {
            return !_appContext.Groupcodes
                            .Any(g => g.Survey.Id == surveyId && g.Code == code);
        }

        public IEnumerable<string> GetUniqueCodes(int surveyId, IEnumerable<string> codesToCheck)
        {
            return codesToCheck
                .Except(_appContext.Groupcodes.Where(s => s.Survey.Id == surveyId).Select(s => s.Code))
                .ToList();
        }
    }
}