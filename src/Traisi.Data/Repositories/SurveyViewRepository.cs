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
    class SurveyViewRepository : Repository<SurveyView>, ISurveyViewRepository
    {

        public SurveyViewRepository(DbContext context) : base(context)
        {

        }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        /// <summary>
        /// Returns the list of survey views that belong to the specified survey with the passed id.
        /// </summary>
        /// <param name="surveyId">The survey id</param>
        /// <returns>(async) A list of all relevent SurveyView objects</returns>
        public Task<List<SurveyView>> GetSurveyViews(int surveyId)
        {
            return _context.Set<SurveyView>().Include(sv => sv.Survey)
                .Where(sv => sv.Survey.Id == surveyId).ToListAsync();
        }

        /// <summary>
        /// Creates a new Survey View associated with the passed survey.
        /// </summary>
        /// <param name="survey"></param>
        /// <returns></returns>
        public async Task<EntityEntry<SurveyView>> CreateSurveyView(Survey survey) => await _context.AddAsync(new SurveyView()
        {
            Survey = survey
        }).ConfigureAwait(false);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewName"></param>
        /// <returns></returns>
        public async Task<SurveyView> GetSurveyViewWithPagesStructureAsync(int surveyId, string viewName)
        {
            var allviews = _appContext.SurveyViews.ToList();
            var surveyView = await _appContext.SurveyViews
                    .Where(sv => sv.ViewName == viewName && sv.Survey.Id == surveyId)
                    .Include(sv => sv.WelcomePageLabels)
                    .Include(sv => sv.TermsAndConditionsLabels)
                    .Include(sv => sv.ThankYouPageLabels)
                    .Include(sv => sv.ScreeningQuestionLabels)
                    .Include(sv => sv.Survey).ThenInclude(s => s.TitleLabels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.Labels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.DescriptionLabels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPart)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qpv => qpv.DescriptionLabels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                    .SingleOrDefaultAsync();
            if (surveyView != null)
            {
                surveyView.QuestionPartViews = surveyView.QuestionPartViews.OrderBy(qp => qp.Order).ToList();
            }
            return surveyView;
        }

        public SurveyView GetSurveyViewWithPagesStructure(int surveyId, string viewName)
        {
            var allviews = _appContext.SurveyViews.ToList();
            var surveyView = _appContext.SurveyViews
                    .Where(sv => sv.ViewName == viewName && sv.Survey.Id == surveyId)
                    .Include(sv => sv.WelcomePageLabels)
                    .Include(sv => sv.TermsAndConditionsLabels)
                    .Include(sv => sv.ThankYouPageLabels)
                    .Include(sv => sv.ScreeningQuestionLabels)
                    .Include(sv => sv.Survey).ThenInclude(s => s.TitleLabels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.Labels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.DescriptionLabels)
                    .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.CATIDependent).ThenInclude(d => d.Labels)
                    .SingleOrDefault();
            surveyView.QuestionPartViews = surveyView.QuestionPartViews.OrderBy(qp => qp.Order).ToList();
            return surveyView;
        }

        public SurveyView GetSurveyViewQuestionAndOptionStructure(int surveyId, string viewName)
        {
            return _appContext.SurveyViews
                .Where(s => s.Survey.Id == surveyId && s.ViewName == viewName)
                .Include(sv => sv.QuestionPartViews).ThenInclude(qpv => qpv.Labels)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qpv => qpv.DescriptionLabels)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(o => o.QuestionOptionLabels)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.Labels)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.DescriptionLabels)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(o => o.QuestionOptionLabels)
                .SingleOrDefault();
        }

        public SurveyView GetSurveyViewQuestionStructure(int surveyId, string viewName)
        {
            return _appContext.SurveyViews
                .Where(s => s.Survey.Id == surveyId && s.ViewName == viewName)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPart)
                .Include(sv => sv.QuestionPartViews).ThenInclude(p => p.QuestionPartViewChildren).ThenInclude(qp => qp.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                .SingleOrDefault();
        }
    }
}