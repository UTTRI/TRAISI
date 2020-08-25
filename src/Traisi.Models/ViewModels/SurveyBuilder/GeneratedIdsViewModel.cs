using System.Collections.Generic;
using FluentValidation;

namespace Traisi.ViewModels.SurveyBuilder
{
    public class GeneratedIdsViewModel
    {
        public int Id { get; set; }
        
        public List<GeneratedIdsViewModel> Children {get;set;}
    }
}