using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Core;
using Traisi.Data.Models;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface ISurveyRepository : IRepository<Survey>
    {
        void LoadSurveyFromJson(Stream data);

        Task<IEnumerable<Survey>> GetAllUserSurveysAsync(string userName);

        Task<IEnumerable<Survey>> GetAllGroupSurveysAsync(string groupName);

        Task<IEnumerable<Survey>> GetAllGroupSurveysAsync(string groupName, string exceptUserName);

        Task<Survey> GetSurveyWithPermissionsAsync(int id);

        Task<Survey> GetSurveyWithUserPermissionsAsync(int id, string userName);

        Task<IEnumerable<Survey>> GetSharedSurveysAsync(string userName);

        Task<Survey> GetSurveyByNameFullAsync(string name);

        Task<Survey> GetSurveyByCodeAsync(string code);

        Task<Survey> GetSurveyByCodeFullAsync(string code);

        Task<Survey> GetSurveyLabelsAndPartsAsync(int surveyId);

        Task<Survey> GetSurveyFullAsync(int surveyId, SurveyViewType viewType);

        Task<Survey> GetSurveyForAnalyticsUse(int surveyId, SurveyViewType viewType);

        Task<Survey> GetSurveyViewerFullAsync(int surveyId, SurveyViewType viewType);

        Task<Survey> GetSurveyWithLabelsAsync(int surveyId, SurveyViewType viewType);

        Task<Survey> GetSurveyFullExportAsync(int surveyId);

        Task<Survey> GetSurveyWithShortcodeAsync(int surveyId, string shortcode);

        Task<bool> ExistsSurveyWithGroupcodeAsync(int surveyId, string groupcode);

        Task<Survey> GetSurveyWithGroupcodeAsync(int surveyId, string groupcode);

        Task<Survey> GetSurveyWithSurveyLogic(int id);

        Task<Survey> GetSurveyWelcomeView(int surveyId, SurveyViewType viewType,string language);

		Task<Survey> GetSurveyWelcomeView(string surveyCode, SurveyViewType viewType,string language);

        bool QuestionNameIsUnique(int surveyId, string name, string oldName);

    }
}