using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Traisi.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class QuestionPartRepository : Repository<QuestionPart>, IQuestionPartRepository
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        public QuestionPartRepository(ApplicationDbContext context) : base(context)
        {
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        public async Task<IEnumerable<QuestionConfiguration>> GetQuestionPartConfigurationsAsync(int id)
        {
            return (await _appContext.QuestionParts
                .Where(q => q.Id == id)
                .Include(q => q.QuestionConfigurations)
                .SingleOrDefaultAsync())?.QuestionConfigurations;

        }
        public async Task<IEnumerable<QuestionOption>> GetQuestionPartOptionsAsync(int id)
        {
            var options = (await _appContext.QuestionParts
                .Where(q => q.Id == id)
                .Include(q => q.QuestionOptions).ThenInclude(o => o.QuestionOptionLabels)
                .SingleOrDefaultAsync())?.QuestionOptions;
            return options?.OrderBy(o => o.Name).ThenBy(o => o.Order);
        }

        public async Task<QuestionPart> GetQuestionPartWithConfigurationsAsync(int id)
        {
            return await _appContext.QuestionParts
                .Where(q => q.Id == id)
                .Include(q => q.QuestionConfigurations)
				.Include(q => q.Survey)
                .SingleOrDefaultAsync();
        }

        public async Task<QuestionPart> GetQuestionPartWithOptionsAsync(int id)
        {
            return await _appContext.QuestionParts
                .Where(q => q.Id == id)
                .Include(q => q.QuestionOptions).ThenInclude(o => o.QuestionOptionLabels)
                .SingleOrDefaultAsync();
        }

        public IEnumerable<QuestionPart> GetQuestionPartsWithConditionals(List<int> ids)
        {
            return _appContext.QuestionParts
               .Where(q => ids.Contains(q.Id))
               .Include(q => q.Conditionals)
               .ToList();
        }

        public QuestionPart GetQuestionPartWithConditionals(int id)
        {
            return  _appContext.QuestionParts
               .Where(q => q.Id == id)
               .Include(q => q.Conditionals)
               .Single();
        }

        public async Task<QuestionPart> GetQuestionPartWithConditionalsAsync(int id)
        {
            return await _appContext.QuestionParts
                .Where(q => q.Id == id)
                .Include(q => q.Conditionals)
                .SingleOrDefaultAsync();
        }


        public async Task<int> GetNumberOfParentViewsAsync(int id)
        {
            return await _appContext.QuestionPartViews
                .Where(q => q.QuestionPart.Id == id)
                .CountAsync();
        }

        public int GetNumberOfParentViews(int id)
        {
            return _appContext.QuestionPartViews
                .Where(q => q.QuestionPart.Id == id)
                .Count();
        }

        public void ClearQuestionParts(List<int> ids)
        {
            _appContext.QuestionParts.RemoveRange(_appContext.QuestionParts.Where(q => ids.Contains(q.Id)));
        }

        public List<int> ClearQuestionPartSurveyField(int surveyId)
        {
            var qParts = _appContext.QuestionParts.Where(q => q.SurveyId == surveyId).ToList();
            qParts.ForEach(q => q.Survey = null);
            _appContext.QuestionParts.UpdateRange(qParts);
            return qParts.Select(q => q.Id).ToList();
        }
    }
}