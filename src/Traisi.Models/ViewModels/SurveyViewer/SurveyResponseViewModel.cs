using System.Collections.Concurrent;
using System.Collections.Generic;
using Traisi.Data.Models.ResponseTypes;
using Newtonsoft.Json.Linq;

namespace Traisi.ViewModels.SurveyViewer
{
    public class SurveyResponseViewModel
    {
        public int QuestionId { get; set; }
        public List<Dictionary<string, object>> ResponseValues { get; set; }

        public ConcurrentDictionary<string, object> Configuration { get; set; }

        public SurveyRespondentViewModel Respondent { get; set; }

    }
}