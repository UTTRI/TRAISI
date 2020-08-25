using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models.Questions;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface IQuestionOptionRepository  : IRepository<QuestionOption> {

	    Task<IEnumerable<QuestionOption>> GetQuestionOptionsFullAsync(int questionId);

        Task<IEnumerable<QuestionOptionConditional>> GetQuestionOptionConditionalsAsync(int optionId);
    }
}