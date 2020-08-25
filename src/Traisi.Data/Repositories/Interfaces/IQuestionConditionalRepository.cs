using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models.Questions;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface IQuestionConditionalRepository  : IRepository<QuestionConditional> {
        /*void DeleteSourceConditionals(int questionPartId, List<int> retainedConditionals);
        void DeleteTargetConditionals(int questionPartId, List<int> retainedConditionals);
        Task<IEnumerable<QuestionConditional>> GetQuestionConditionalsAsync(int questionPartId);

        void ValidateSourceConditionals(int questionPartId, List<int> viableQuestionTargets);
        void ValidateTargetConditionals(int questionPartId, List<int> viableQuestionSources); */
    }
}