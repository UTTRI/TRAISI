using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.Questions {
	[SurveyQuestion (QuestionResponseType.OptionSelect, CodeBundleName = "traisi-questions-general.module.js")]
	public class RadioQuestion : ISurveyQuestion {
		public string TypeName => "radio";

		public string Icon {
			get => "far fa-dot-circle";
		}
		public QuestionIconType IconType { get => QuestionIconType.FONT; }

		[QuestionOption (QuestionOptionValueType.KeyValuePair,
			IsMultipleAllowed = true,
			Name = "Response Options",
			Description = "The list of available radio responses presented to the user.",
			SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
		public ICollection ResponseOptions;

		[QuestionConfiguration (ConfigurationValueType.Boolean,
			DisplayName = "AllowCustomResponse",
			Description = "Allow user to enter their own custom response.",
			SurveyBuilderValueType = QuestionBuilderType.Switch,
			DefaultValue = false)]
		public bool AllowCustomResponse = false;

		[QuestionConfiguration (ConfigurationValueType.String,
			DisplayName = "CustomResponseOptions",
			Description = "A comma separated list of option codes that will display the custom response.",
			SurveyBuilderValueType = QuestionBuilderType.Text,
			DefaultValue = "")]
		public ICollection OptionsWWithCustomResponse;
	}

}