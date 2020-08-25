using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Models.Extensions;

namespace Traisi.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class SurveyLogicRepository : Repository<SurveyLogic>, ISurveyLogicRepository
    {
        public SurveyLogicRepository(ApplicationDbContext context) : base(context) { }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="question"></param>
        /// <returns></returns>
        public async Task<List<SurveyLogic>> GetSurveyLogicExpressionTreeForQuestionAsync(QuestionPart question)
        {
            var list = await this._entities.Where(x => x.ValidationQuestionId == question.Id)
                .Include(s => s.Expressions).ThenInclude(s => s.Expressions)
               .Include(s => s.ValidationMessages)
               .Include(s => s.Expressions).ThenInclude(s => s.ValidationMessages)
               .Include(s => s.Expressions).ThenInclude(s => s.Expressions).ThenInclude(s => s.Expressions)
               .Include(s => s.Expressions)

            .ToListAsync();
            return list;
        }

    }
}