using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Traisi.Data.Core;
using Traisi.Data.Models;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;

namespace Traisi.Data.Repositories
{
    public class SurveyRepository : Repository<Survey>, ISurveyRepository
    {
        public SurveyRepository(ApplicationDbContext context) : base(context) { }

        public SurveyRepository(DbContext context) : base(context) { }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

        /// <summary>
        /// Loads a survey and all associated objects from a given inputstream with JSON data
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async void LoadSurveyFromJson(Stream data)
        {
            await this.AddAsync(new Survey());
        }

        /// <summary>
        /// Finds a survey with the specified name (case insensitive)
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyByNameFullAsync(string name)
        {
            return await _appContext.Surveys
                .Where(s => String.Equals(s.Name, name, StringComparison.CurrentCultureIgnoreCase))
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels)
                .Include(s => s.TitleLabels)
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="groupcode"></param>
        /// <returns></returns>
        public async Task<bool> ExistsSurveyWithGroupcodeAsync(int surveyId, string groupcode)
        {
            return await _appContext.Surveys.Where(s => s.Id == surveyId).AnyAsync(s => s.GroupCodes.Any(gc => gc.Code == groupcode));
        }

        /// <summary>
        /// 
        /// /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="groupcode"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWithGroupcodeAsync(int surveyId, string groupcode)
        {
            return await _appContext.Surveys.Where(s => s.Id == surveyId).SingleOrDefaultAsync(s => s.GroupCodes.Any(gc => gc.Code == groupcode));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyByCodeFullAsync(string code)
        {
            var res = await _appContext.Surveys
                .Where(s => s.Code == code)
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels)
                .Include(s => s.TitleLabels)
                .Select(r => new
                {
                    Survey = r,
                    HasGroupCodes = r.GroupCodes.Count() > 0
                })
                .FirstOrDefaultAsync();

            res.Survey.HasGroupCodes = res.HasGroupCodes;
            return res.Survey;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyByCodeAsync(string code)
        {
            return await _appContext.Surveys
                .Where(s => String.Equals(s.Code, code)).
            Include(s => s.TitleLabels)
                .FirstOrDefaultAsync();
        }

        public async Task<Survey> GetSurveyLabelsAndPartsAsync(int surveyId)
        {
            return await _appContext.Surveys.Where(s => s.Id == surveyId)
                .Include(s => s.TitleLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart)
                .SingleOrDefaultAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyFullExportAsync(int surveyId)
        {
            var survey = await _appContext.Surveys.Where(s => s.Id == surveyId)
                .Include(s => s.TitleLabels)
                .Include(s => s.SurveyLogic).ThenInclude(s => s.Expressions).ThenInclude(s => s.Expressions)
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionConditionalsTarget)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.Conditionals).ThenInclude(qo => qo.Expressions).ThenInclude(qo => qo.Expressions)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.Conditionals).ThenInclude(qp => qp.Expressions).ThenInclude(qp => qp.Expressions)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionConditionalsTarget)
                .SingleOrDefaultAsync();

            foreach (var logic in survey.SurveyLogic)
            {
                await LoadFullSurveyLogic(logic);
            }

            return survey;

        }

        private async Task LoadFullSurveyLogic(SurveyLogic logic)
        {

            if (!_appContext.Entry(logic).Collection(c => c.ValidationMessages).IsLoaded)
            {
                await _appContext.Entry(logic).Collection(c => c.ValidationMessages).LoadAsync();
            }

            if (!_appContext.Entry(logic).Collection(c => c.Expressions).IsLoaded)
            {
                await _appContext.Entry(logic).Collection(c => c.Expressions).LoadAsync();
            }
            foreach (var childLogic in logic.Expressions)
            {
                await LoadFullSurveyLogic(childLogic);
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWithLabelsAsync(int surveyId, SurveyViewType viewType)
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";
            var result = await _appContext.Surveys.Where(s => s.Id == surveyId)
                .Include(s => s.TitleLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels).Where(s => s.SurveyViews.Any(s2 => s2.ViewName == viewName))
                .SingleOrDefaultAsync();
            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="code"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWelcomeView(string code, SurveyViewType viewType, string language = "en")
        {
            return await GetSurveyWelcomeView(_appContext.Surveys.Where(s => s.Code == code), viewType);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWelcomeView(int surveyId, SurveyViewType viewType, string language = "en")
        {
            return await GetSurveyWelcomeView(_appContext.Surveys.Where(s => s.Id == surveyId), viewType);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="query"></param>
        /// <param name="viewName"></param>
        /// <returns></returns>
        private async Task<Survey> GetSurveyWelcomeView(IQueryable<Survey> query, SurveyViewType viewType, string language = "en")
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";
            var result = await query.Select(s => new
            {
                WelcomePageLabels = s.SurveyViews.Where(v => v.ViewName == viewName).FirstOrDefault().WelcomePageLabels.Where(l => l.Language == language).FirstOrDefault(),
                TermsAndConditionsLabels = s.SurveyViews.Where(v => v.ViewName == viewName).FirstOrDefault().TermsAndConditionsLabels.Where(l => l.Language == language).FirstOrDefault(),
                Survey = new Survey()
                {
                    Id = s.Id,
                    Name = s.Name,
                    HasGroupCodes = s.HasGroupCodes,
                    TitleLabels = s.TitleLabels,
                    //SurveyViews = new SurveyViewCollection<SurveyView>(new List<SurveyView> { new SurveyView() {
                    //    WelcomePageLabels = s.SurveyViews.Where( v => v.ViewName == viewName).Single().WelcomePageLabels,
                    //    TermsAndConditionsLabels = s.SurveyViews.Where( v => v.ViewName == viewName).Single().TermsAndConditionsLabels
                    //}})
                }
            }).FirstOrDefaultAsync();
            result.Survey.SurveyViews = new SurveyViewCollection<SurveyView>(new List<SurveyView> {
                new SurveyView () {
                    ViewName = viewName,
                        Survey = result.Survey,
                        WelcomePageLabels = new LabelCollection<Label> (result.WelcomePageLabels),
                        TermsAndConditionsLabels = new LabelCollection<Label> (result.TermsAndConditionsLabels)
                }
            });
            return result.Survey;
        }

        public async Task<Survey> GetSurveyViewerFullAsync(int surveyId, SurveyViewType viewType)
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";

            var result = await _appContext.Surveys.Where(s => s.Id == surveyId)
                .Include(s => s.TitleLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.Labels)
                // .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                // .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                // .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptionConditionalsSource)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.Conditionals)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.Conditionals).ThenInclude(x => x.Expressions).ThenInclude(x => x.Expressions)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                // .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Where(s => s.SurveyViews.Any(s2 => s2.ViewName == viewName))
                .SingleOrDefaultAsync();

            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyFullAsync(int surveyId, SurveyViewType viewType)
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";

            var result = await _appContext.Surveys.Where(s => s.Id == surveyId)
                .Include(s => s.TitleLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.WelcomePageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.TermsAndConditionsLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ThankYouPageLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.ScreeningQuestionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptionConditionalsSource)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.Conditionals)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.Conditionals).ThenInclude(x => x.Expressions).ThenInclude(x => x.Expressions)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Where(s => s.SurveyViews.Any(s2 => s2.ViewName == viewName))
                .SingleOrDefaultAsync();

            return result;
        }


        ///
        public async Task<Survey> GetSurveyForAnalyticsUse(int surveyId, SurveyViewType viewType)
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";

            var result = await _appContext.Surveys.Where(s => s.Id == surveyId)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.Labels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.DescriptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptionConditionalsSource)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionConfigurations).ThenInclude(qc => qc.QuestionConfigurationLabels)
                .Include(s => s.SurveyViews).ThenInclude(v => v.QuestionPartViews).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q => q.QuestionPartViewChildren).ThenInclude(q2 => q2.QuestionPart).ThenInclude(qp => qp.QuestionOptions).ThenInclude(qo => qo.QuestionOptionLabels)
                .Where(s => s.SurveyViews.Any(s2 => s2.ViewName == viewName))
                .SingleOrDefaultAsync();

            return result;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWithShortcodeAsync(int surveyId, string shortcode)
        {
            var result = await _appContext.Shortcodes.Where(s => s.Code == shortcode).Where(s => s.Survey.Id == surveyId)
                .Include(s => s.Survey).FirstOrDefaultAsync();

            return result?.Survey;

        }

        /// <summary>
        /// Gets all surveys owned by a specific user
        /// </summary>
        /// <param name="userName"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Survey>> GetAllUserSurveysAsync(string userName)
        {
            return await _appContext.Surveys
                .Where(s => s.Owner == userName)
                .Include(s => s.SurveyPermissions)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();
        }

        /// <summary>
        /// Gets all surveys owned by a specific group
        /// </summary>
        /// <param name="groupName"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Survey>> GetAllGroupSurveysAsync(string groupName)
        {
            return await _appContext.Surveys
                .Where(s => s.Group == groupName)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();
        }

        /// <summary>
        /// Gets all surveys owned by other members of a specific group
        /// with permission for specific user
        /// </summary>
        /// <param name="groupName">name of group</param>
        /// <param name="exceptUserName">user to exclude from list</param>
        /// <returns></returns>
        public async Task<IEnumerable<Survey>> GetAllGroupSurveysAsyncBackup(string groupName, string exceptUserName)
        {
            return await _appContext.Surveys
                .Where(s => s.Group == groupName && s.Owner != exceptUserName &&
                   s.SurveyPermissions.Where(r => r.User.UserName == exceptUserName).Count() == 0)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="groupName"></param>
        /// <param name="exceptUserName"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Survey>> GetAllGroupSurveysAsync(string groupName, string exceptUserName)
        {
            return await _appContext.Surveys
                .Where(s => s.Group == groupName &&
                   s.SurveyPermissions.Where(r => r.User.UserName == exceptUserName).Count() == 0)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();
        }

        /// <summary>
        /// Gets a survey with its permissions
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWithPermissionsAsync(int id)
        {
            return await _appContext.Surveys
                .Where(s => s.Id == id)
                .Include(s => s.SurveyPermissions)
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get survey with permissions for given user
        /// </summary>
        /// <param name="id"></param>
        /// <param name="userName"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWithUserPermissionsAsync(int id, string userName)
        {
            var survey = await _appContext.Surveys
                .Where(s => s.Id == id)
                .SingleOrDefaultAsync();
            survey.SurveyPermissions = await _appContext.SurveyPermissions
                .Where(sp => sp.Survey == survey && sp.User.UserName == userName)
                .ToListAsync();
            return survey;
        }

        /// <summary>
        /// Get all surveys shared with given user
        /// </summary>
        /// <param name="userName"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Survey>> GetSharedSurveysAsync(string userName)
        {
            var surveyPermissions = await _appContext.SurveyPermissions
                .Where(sp => sp.User.UserName == userName)
                .Include(sp => sp.Survey).Include(sp => sp.User)
                .ToListAsync();

            List<Survey> sharedSurveys = new List<Survey>();

            surveyPermissions.ForEach(sp =>
            {
                sharedSurveys.Add(sp.Survey);
                sp.Survey.SurveyPermissions = new List<SurveyPermission> {
                    sp
                };
            });

            return sharedSurveys;
        }

        public bool QuestionNameIsUnique(int surveyId, string name, string oldName)
        {
            if (name == oldName)
            {
                return true;
            }

            var surveyViewIds = _appContext.Surveys
                .Where(s => s.Id == surveyId)
                .SelectMany(s => s.SurveyViews)
                .Select(v => v.Id)
                .ToList();

            var pages = _appContext.QuestionPartViews
                .Where(v => surveyViewIds.Contains(v.SurveyView.Id))
                .Include(qpv => qpv.QuestionPart)
                .Include(qpv => qpv.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                .Include(qpv => qpv.QuestionPartViewChildren).ThenInclude(qpv => qpv.QuestionPart)
                .ToList();

            var qpartNames = this.GetQuestionPartNames(pages);
            return !qpartNames.Contains(name);
        }

        private List<string> GetQuestionPartNames(List<QuestionPartView> partviews)
        {
            List<string> qpartnames = new List<string>();

            foreach (var partview in partviews)
            {
                if (partview.QuestionPart != null)
                {
                    qpartnames.Add(partview.QuestionPart.Name);
                }
                else
                {
                    /*foreach (var child in partview.QuestionPartViewChildren)
                    {
                        if (child.QuestionPart != null)
                        {
                            qpartnames.Add(child.QuestionPart.Name);
                        }
                        else
                        {
                            foreach (var subchild in child.QuestionPartViewChildren)
                            {
                                qpartnames.Add(subchild.QuestionPart.Name);
                            }
                        }
                    }*/
                    qpartnames.AddRange(this.GetQuestionPartNames(partview.QuestionPartViewChildren.ToList()));
                }
            }
            return qpartnames.Distinct().ToList();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyWithSurveyLogic(int id)
        {
            var survey = await _appContext.Surveys
                .Where(s => s.Id == id)
                .Include(s => s.SurveyLogic).ThenInclude(s => s.Expressions).ThenInclude(s => s.Expressions)
                .Include(s => s.SurveyLogic).ThenInclude(s => s.ValidationMessages)
                .Include(s => s.SurveyLogic).ThenInclude(s => s.Expressions).ThenInclude(s => s.ValidationMessages)
                .Include(s => s.SurveyLogic).ThenInclude(s => s.Expressions).ThenInclude(s => s.Expressions)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            return survey;
        }
    }
}