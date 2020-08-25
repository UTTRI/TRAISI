using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;


namespace Traisi.Data.Repositories.Interfaces
{
    public interface IQuestionPartRepository : IRepository<QuestionPart>
    {

        Task<QuestionPart> GetQuestionPartWithConfigurationsAsync(int id);
        Task<QuestionPart> GetQuestionPartWithOptionsAsync(int id);
        Task<IEnumerable<QuestionConfiguration>> GetQuestionPartConfigurationsAsync(int id);
        Task<IEnumerable<QuestionOption>> GetQuestionPartOptionsAsync(int id);

        IEnumerable<QuestionPart> GetQuestionPartsWithConditionals(List<int> ids);
        QuestionPart GetQuestionPartWithConditionals(int id);


        Task<int> GetNumberOfParentViewsAsync(int id);
        int GetNumberOfParentViews(int id);

        void ClearQuestionParts(List<int> ids);
        List<int> ClearQuestionPartSurveyField(int surveyId);
    }
}