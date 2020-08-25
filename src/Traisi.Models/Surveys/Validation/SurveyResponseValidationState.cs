
using System.Collections.Generic;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;

namespace Traisi.Models.Surveys.Validation
{

    public class SurveyResponseValidationState
    {
        public bool IsValid { get; set; }
        public SurveyValidationError SurveyLogicError { get; set; }
        public SurveyValidationError SurveyQuestionValidationError { get; set; }
    }

    public class SurveyValidationError
    {
        public List<int> RelatedQuestions { get;set; }
        public LabelCollection<Label> Messages { get; set; } = new LabelCollection<Label>();
        public ValidationState ValidationState { get; set; }
    }

    public enum ValidationState
    {
        Invalid,
        Valid,
        Untouched,
        Touched
    }

}