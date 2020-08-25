using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Traisi.ViewModels.Questions
{
    public class SBQuestionTypeDefinitionViewModel
    {
        public string TypeName { get; set; }

        public Dictionary<string, QuestionOptionDefinitionViewModel> QuestionOptions { get; set; }

        public Dictionary<string, QuestionConfigurationDefinitionViewModel> QuestionConfigurations { get; set; }

        public string Icon { get; set; }

        public string ResponseType { get; set; }

        public Dictionary<string, string> TypeNameLocales { get; set; }

        public bool HasCustomBuilderView { get; set; }

        public string CustomBuilderViewName { get; set; }
    }
}
