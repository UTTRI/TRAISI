using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Models.Surveys;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using DAL.Models.Questions;

namespace DAL.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class QuestionPartViewRepository : Repository<QuestionPartView>, IQuestionPartViewRepository
    {
        public QuestionPartViewRepository(ApplicationDbContext context) : base(context) { }
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        public async Task<QuestionPartView> GetQuestionPartViewWithStructureAsync(int questionPartViewId)
        {
            var questionPartView = await _appContext.QuestionPartViews
                    .Where(qp => qp.Id == questionPartViewId)
                    .Include(qp => qp.QuestionPart)
                    .Include(qp => qp.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .SingleOrDefaultAsync();
            questionPartView.QuestionPartViewChildren = questionPartView.QuestionPartViewChildren.OrderBy(qp => qp.Order).ToList();
            return questionPartView;
        }
    }
}