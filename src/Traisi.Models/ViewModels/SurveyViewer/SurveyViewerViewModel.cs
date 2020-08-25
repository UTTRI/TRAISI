using System.Collections.Generic;
using Traisi.ViewModels;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.ViewModels.SurveyViewer

{
    public class SurveyViewerViewModel
    {
        public int Id { get; set; }

        public string ViewName { get; set; }

        public SurveyViewModel Survey { get; set; }

        public List<QuestionPartViewViewModel> Questions;

        public string TitleText { get; set; }

        public string TermsAndConditionsText { get; set; } 

        public string WelcomeText { get; set; }

        public string SurveyCompletionText { get; set; }

		public List<string> ScreeningQuestions {get;set;}
    }
}