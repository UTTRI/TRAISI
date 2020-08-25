using System.Collections.Generic;
using Traisi.Data.Models.Questions;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.Models.ViewModels 
{
    public class SurveyViewSectionViewModel
    {
        public int Id { get; set; }

        public int Order { get; set; }
        public List<QuestionViewModel> Questions { get; set; }

        public string Label { get; set; }

        public string DescriptionLabel {get;set;}

        public string Icon { get; set; }

        public bool IsHousehold {get;set;}

        public int RepeatSource { get; set; }

        public bool IsRepeat { get; set; }

		public bool IsMultiView {get;set;}

    }
}