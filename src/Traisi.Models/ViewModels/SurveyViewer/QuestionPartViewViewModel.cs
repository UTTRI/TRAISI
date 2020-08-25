using System.Collections.Generic;

namespace Traisi.ViewModels.SurveyViewer
{
    public class QuestionPartViewViewModel
    {
        public int Id { get; set; }

        public string Label { get; set; }

        public string DescriptionLabel {get;set;}

        public List<QuestionPartViewViewModel> QuestionChildren;

        public int Order { get; set; }

        public string QuestionType { get; set; }

    }
}