using DAL.Models.Surveys;
using Newtonsoft.Json;

namespace DAL.Models.Surveys
{
    public class ScreeningQuestionsPageLabel: Label
    {
        [JsonIgnore]
        public int Id { get; set; }

        [JsonIgnore]
        public int SurveyViewId { get; set; }

        public SurveyView SurveyView { get; set; }
    }
}