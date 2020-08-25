using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Traisi.ViewModels.Questions
{
    public class QuestionConfigurationDefinitionViewModel
    {
        public string PropertyName { get; set; }

        public string Name { get; set; }

        public string DisplayName {get;set;}

        public string Description { get; set; }

        public string ValueType { get; set; }

        public string BuilderType { get; set; }

        public string DefaultValue { get; set; }

		public string ResourceData { get; set; }
    }
}
