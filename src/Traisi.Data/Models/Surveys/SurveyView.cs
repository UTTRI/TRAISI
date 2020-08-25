using System.Collections.Generic;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Models.Questions;
using Newtonsoft.Json;

namespace Traisi.Data.Models.Surveys
{
    public class SurveyView : ISurveyView, IEntity
    {
        [JsonIgnore]
        public int Id { get; set; }

        public Survey Survey { get; set; }

        [JsonIgnore]
        public int SurveyId { get; set; }

        public ICollection<QuestionPartView> QuestionPartViews { get; set; }
        public LabelCollection<Label> WelcomePageLabels { get; set; }
        public LabelCollection<Label> TermsAndConditionsLabels { get; set; }
        public LabelCollection<Label> ThankYouPageLabels { get; set; }

        public LabelCollection<Label> ScreeningQuestionLabels { get; set; }

        public string ViewName { get; set; }

        public SurveyView()
        {
            this.QuestionPartViews = new List<QuestionPartView>();
            
            
        }
    }
}