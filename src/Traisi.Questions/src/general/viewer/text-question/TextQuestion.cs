using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions {

	[SurveyQuestion (QuestionResponseType.String,
		CodeBundleName = "traisi-questions-general.module.js",
		ResponseValidator = typeof (TextQuestionValidator)), ]
	public class TextQuestion : ISurveyQuestion {
		public string TypeName {
			get => "text";
		}
		public string Icon {
			get => "fas fa-align-left";
		}
		public QuestionIconType IconType { get => QuestionIconType.FONT; }

		[QuestionConfiguration (ConfigurationValueType.Integer,
			DisplayName = TextQuestionConfiguration.MAX_LENGTH,
			Description = "Max number of characters",
			SurveyBuilderValueType = QuestionBuilderType.NumericText,
			DefaultValue = 255)]
		public int MaxLength = 255;

		[QuestionConfiguration (ConfigurationValueType.Boolean,
			DisplayName = TextQuestionConfiguration.MULTILINE,
			SurveyBuilderValueType = QuestionBuilderType.Switch,
			Description = "Specifies whether to render a text field or text area.",
			DefaultValue = "false")]
		public bool IsMultiLine = false;

		[QuestionConfiguration (ConfigurationValueType.String,
			DisplayName = TextQuestionConfiguration.INPUT_MASK,
			SurveyBuilderValueType = QuestionBuilderType.Text,
			Description = "Configure a unique input mask",
			DefaultValue = "")]
		public bool InputMask = false;

	}

}