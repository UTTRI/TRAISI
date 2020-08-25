using System.Collections.Generic;
using FluentValidation;

namespace Traisi.ViewModels.SurveyBuilder
{
    public class SBPageStructureViewModel
    {
        public string Id { get; set; }
        public string Label { get; set; }
        public string DescriptionLabel {get;set;}
        public string Type { get; set; }
        public List<SBPageStructureViewModel> Children { get; set; }
    }
}