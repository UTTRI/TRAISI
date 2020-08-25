using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
namespace Traisi.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class QuestionConditionalRepository : Repository<QuestionConditional>, IQuestionConditionalRepository
    {
  
        public QuestionConditionalRepository(ApplicationDbContext context) : base(context)
        {

        }
        
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        /*public void DeleteSourceConditionals(int questionPartId, List<int> retainedConditionals)
        {
            _appContext.QuestionConditionals.RemoveRange(_appContext.QuestionConditionals.Where(c => c.SourceQuestionId == questionPartId && !retainedConditionals.Contains(c.Id)));
        }
        public void DeleteTargetConditionals(int questionPartId, List<int> retainedConditionals)
        {
            _appContext.QuestionConditionals.RemoveRange(_appContext.QuestionConditionals.Where(c => c.TargetQuestionId == questionPartId && !retainedConditionals.Contains(c.Id)));
        }

        /*public async Task<IEnumerable<QuestionConditional>> GetQuestionConditionalsAsync(int questionPartId)
        {
            return await _appContext.QuestionConditionals
                .Where(q => q.SourceQuestionId == questionPartId || q.TargetQuestionId == questionPartId)
                .ToListAsync();
        }*/

        /*public void ValidateSourceConditionals(int questionPartId, List<int> viableQuestionTargets)
        {
            _appContext.QuestionConditionals.RemoveRange(_appContext.QuestionConditionals.Where(c => c.SourceQuestionId == questionPartId && !viableQuestionTargets.Contains(c.TargetQuestionId)));
        }
        public void ValidateTargetConditionals(int questionPartId, List<int> viableQuestionSources)
        {
            _appContext.QuestionConditionals.RemoveRange(_appContext.QuestionConditionals.Where(c => !viableQuestionSources.Contains(c.SourceQuestionId) && c.TargetQuestionId == questionPartId));
        }*/
    }
}