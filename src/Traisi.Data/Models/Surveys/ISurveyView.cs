using System.Collections.Generic;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;

namespace Traisi.Data.Models.Surveys
{
    public interface ISurveyView
    {
        int Id { get; set; }
        string ViewName { get; set; }
        Survey Survey { get; set; }
        
        ICollection<QuestionPartView> QuestionPartViews { get; set; }
        LabelCollection<Label> WelcomePageLabels { get; set; }
        
        LabelCollection<Label> TermsAndConditionsLabels { get; set; }
        LabelCollection<Label> ThankYouPageLabels { get; set; }

        LabelCollection<Label> ScreeningQuestionLabels { get; set; }
    }
}