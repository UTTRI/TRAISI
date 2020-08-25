using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.ViewModels.SurveyViewer;
using Traisi.ViewModels;


namespace Traisi.ViewModels.SurveyBuilder
{
    public class SBSurveyViewViewModel
    {
        public int Id { get; set; }
        public int SurveyId { get; set; }
        public string ViewName { get; set; }
        public List<SBQuestionPartViewViewModel> Pages { get; set; }
        public TermsAndConditionsPageLabelViewModel TermsAndConditionsPage { get; set; }

        public WelcomePageLabelViewModel WelcomePage { get; set; }

        public ThankYouPageLabelViewModel SurveyCompletionPage { get; set; }

        public ScreeningQuestionsLabelViewModel ScreeningQuestions { get; set; }
    }

}
