using System.Collections.Generic;
using Traisi.Models.ViewModels;

namespace Traisi.ViewModels.SurveyViewer
{
    /// <summary>
    /// View model that represents a single page or (root) view
    /// </summary>
    public class SurveyViewPageViewModel
    {
        public int Id { get; set; }

        public List<SurveyViewSectionViewModel> Sections { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public List<QuestionViewModel> Questions { get; set; }

        public int Order { get; set; }

        public string Label { get; set; }

        public string Icon { get; set; }
    }
}