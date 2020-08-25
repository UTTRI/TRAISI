using System.Collections.Generic;

namespace Traisi.ViewModels.SurveyViewer
{
    public class SurveyRespondentGroupViewModel
    {
        public int Id { get; set; }
        List<SurveyRespondentViewModel> Respondents { get; set; }
    }
}