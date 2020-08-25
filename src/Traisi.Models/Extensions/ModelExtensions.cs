using System;
using System.Linq;
using Traisi.Data.Core;
using Traisi.Data.Models.Surveys;

namespace Traisi.Models.Extensions {

    public static class ModelExtensions {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public static SurveyView GetSurveyView(this Survey survey, SurveyViewType viewType)
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";
            return survey.SurveyViews.FirstOrDefault(v => v.ViewName == viewName);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public static SurveyView GetSurveyView(this Survey survey, string viewType)
        {
            return survey.SurveyViews.FirstOrDefault(v => v.ViewName.Equals(viewType,StringComparison.OrdinalIgnoreCase));
        }
    }
}