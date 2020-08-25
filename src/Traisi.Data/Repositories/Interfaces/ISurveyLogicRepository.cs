using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface ISurveyLogicRepository : IRepository<SurveyLogic>
    {

        public Task<List<SurveyLogic>> GetSurveyLogicExpressionTreeForQuestionAsync(QuestionPart question);
    }
}