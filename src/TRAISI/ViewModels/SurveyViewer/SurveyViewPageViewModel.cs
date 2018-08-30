using System.Collections.Generic;

namespace TRAISI.ViewModels.SurveyViewer
{
    /// <summary>
    /// View model that represents a single page or (root) view
    /// </summary>
    public class SurveyViewPageViewModel
    {
        public int Id { get; set; }
        
        public List<QuestionViewModel> Questions { get; set; }
        
        public int Order { get; set; }
        
        public string Label { get; set; }
    }
}