
using System.Collections.Generic;

namespace Traisi.Models.ViewModels 
{

    public class SurveyCompletionStatus
    {
        public List<int> CompletedQuestionIds {get;set; } = new List<int>();
    }

    public class RespondentCompletionStatus
    {
        public Dictionary<int, bool> HasResponse { get; set; } = new Dictionary<int, bool>();
    }
}