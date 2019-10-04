using TRAISI.SDK.Attributes;
using TRAISI.SDK.Enums;
using TRAISI.SDK.Interfaces;
using TRAISI.SDK.Library.ResponseTypes;

namespace TRAISI.SDK.Questions {

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
			Name = TextQuestionConfiguration.MAX_LENGTH,
			Description = "Max number of characters",
			SurveyBuilderValueType = QuestionBuilderType.NumericText,
			DefaultValue = 255)]
		public int MaxLength = 255;

		[QuestionConfiguration (ConfigurationValueType.Boolean,
			Name = TextQuestionConfiguration.MULTILINE,
			SurveyBuilderValueType = QuestionBuilderType.Switch,
			Description = "Specifies whether to render a text field or text area.",
			DefaultValue = "false")]
		public bool IsMultiLine = false;

		[QuestionConfiguration (ConfigurationValueType.String,
			Name = TextQuestionConfiguration.INPUT_MASK,
			SurveyBuilderValueType = QuestionBuilderType.Text,
			Description = "Configure a unique input mask",
			DefaultValue = "")]
		public bool InputMask = false;

	}

}