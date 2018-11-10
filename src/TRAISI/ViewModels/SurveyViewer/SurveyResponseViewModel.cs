using System.Collections.Concurrent;
using System.Collections.Generic;
using DAL.Models.ResponseTypes;
using Newtonsoft.Json.Linq;

namespace TRAISI.ViewModels.SurveyViewer
{
    public class SurveyResponseViewModel
    {

        public List<Dictionary<string, object>> ResponseValues { get; set; }

        public ConcurrentDictionary<string, object> Configuration { get; set; }


    }
}