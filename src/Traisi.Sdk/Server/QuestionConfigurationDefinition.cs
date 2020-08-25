using System.Collections.Generic;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk {
	public class QuestionConfigurationDefinition {
		public string PropertyName { get; set; }

		public string DisplayName {get;set;}

		public string Description { get; set; }

		public ConfigurationValueType ValueType { get; set; }

		public QuestionBuilderType BuilderType { get; set; }

		public object TypeId { get; set; }

		public object DefaultValue { get; set; }

		public string SharedResource { get; set; }

		public byte[] ResourceData { get; set; }

		public bool IsTranslatable { get; set; }

		public Dictionary<string,string> Configuration {get;set;}
	}
}