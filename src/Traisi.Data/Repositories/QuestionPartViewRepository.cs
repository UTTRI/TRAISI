using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Traisi.Data.Models.Questions;

namespace Traisi.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class QuestionPartViewRepository : Repository<QuestionPartView>, IQuestionPartViewRepository
    {
        public QuestionPartViewRepository(ApplicationDbContext context) : base(context) { }
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        public async Task<QuestionPartView> GetQuestionPartViewWithStructureAsync(int? questionPartViewId)
        {
            var questionPartView = await _appContext.QuestionPartViews
                    .Where(qp => qp.Id == questionPartViewId)
                    .Include(qp => qp.QuestionPart)
                    .Include(qp => qp.Labels)
                    .Include(qp => qp.DescriptionLabels)
                    .Include(qp => qp.RepeatSource)
                    .Include(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.DescriptionLabels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.RepeatSource)
                    .Include(sv => sv.QuestionPartViewChildren).ThenInclude(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.DescriptionLabels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.RepeatSource)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(sv => sv.QuestionPartViewChildren).ThenInclude(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .SingleOrDefaultAsync();
            if (questionPartView != null)
            {
                questionPartView.QuestionPartViewChildren = questionPartView.QuestionPartViewChildren.OrderBy(qp => qp.Order).ToList();
            }
            return questionPartView;
        }

        public Task<QuestionPartView> GetQuestionPartViewWithConditionals(int id)
        {
            return _appContext.QuestionPartViews
               .Where(q => q.Id == id)
               .FirstOrDefaultAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Task<QuestionPartView> GetQuestionPartViewLogic(int id)
        {
            return _appContext.QuestionPartViews.Where(q => q.Id == id)
                .Include(x => x.QuestionPart).ThenInclude(x => x.Conditionals)
                .ThenInclude(x => x.Expressions).ThenInclude(x => x.Expressions).ThenInclude(x => x.Expressions)
                .ThenInclude(x => x.ValidationMessages).FirstOrDefaultAsync();
        }

        public QuestionPartView GetQuestionPartViewWithStructure(int questionPartViewId)
        {
            var questionPartView = _appContext.QuestionPartViews
                    .Where(qp => qp.Id == questionPartViewId)
                    .Include(qp => qp.QuestionPart)
                    .Include(qp => qp.Labels)
                    .Include(qp => qp.DescriptionLabels)
                    .Include(qp => qp.RepeatSource)
                    .Include(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.RepeatSource)
                    .Include(sv => sv.QuestionPartViewChildren).ThenInclude(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.DescriptionLabels)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qp => qp.RepeatSource)
                    .Include(qp => qp.QuestionPartViewChildren).ThenInclude(sv => sv.QuestionPartViewChildren).ThenInclude(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .SingleOrDefault();
            if (questionPartView != null)
            {
                questionPartView.QuestionPartViewChildren = questionPartView.QuestionPartViewChildren.OrderBy(qp => qp.Order).ToList();
            }
            return questionPartView;
        }

        public List<QuestionPartView> GetQuestionPartViewsWithParent(int questionPartViewParentId)
        {
            return _appContext.QuestionPartViews
                .Where(qp => qp.ParentView.Id == questionPartViewParentId)
                .ToList();
        }
    }
}