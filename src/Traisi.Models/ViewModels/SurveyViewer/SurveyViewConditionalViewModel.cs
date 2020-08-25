using Traisi.Data.Core;

namespace Traisi.ViewModels.SurveyViewer
{
    public class SurveyViewConditionalViewModel
    {
        public QuestionConditionalType ConditionalType { get; set; }

        public int SourceQuestionId { get; set; }

        public int TargetQuestionId { get; set; }

        public string Value { get; set; }
    }
}