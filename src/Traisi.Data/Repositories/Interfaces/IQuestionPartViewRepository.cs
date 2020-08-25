using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;

namespace Traisi.Data.Repositories.Interfaces {
	public interface IQuestionPartViewRepository : IRepository<QuestionPartView> 
	{
		Task<QuestionPartView> GetQuestionPartViewWithStructureAsync (int? questionPartViewId);

        QuestionPartView GetQuestionPartViewWithStructure(int questionPartViewId);

        List<QuestionPartView> GetQuestionPartViewsWithParent(int questionPartViewParentId);

		Task<QuestionPartView> GetQuestionPartViewWithConditionals(int id);

		Task<QuestionPartView> GetQuestionPartViewLogic(int id);
	}
}