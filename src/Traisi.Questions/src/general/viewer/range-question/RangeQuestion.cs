using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
	[SurveyQuestion(QuestionResponseType.Number, CodeBundleName = "traisi-questions-general.module.js")]
	public class RangeQuestion : ISurveyQuestion
	{
		public string TypeName => "range";

		public string Icon
		{
			get => "fas fa-arrows-alt-h";
		}
		public QuestionIconType IconType { get => QuestionIconType.FONT; }

		[QuestionConfiguration(ConfigurationValueType.String,
		DisplayName = "Number Format",
		Description = "Format of the number.",
		SurveyBuilderValueType = QuestionBuilderType.SingleSelect,
		DefaultValue = "Integer",
		Resource = "numberquestion-format")]
		public string Format = "Integer";

		[QuestionConfiguration(ConfigurationValueType.Integer,
		DisplayName = "Min",
		Description = "Minimum Number.",
		SurveyBuilderValueType = QuestionBuilderType.NumericText,
		DefaultValue = "0")]
		public int Min = 0;

		[QuestionConfiguration(ConfigurationValueType.Integer,
		DisplayName = "Max",
		Description = "Maximum Number.",
		SurveyBuilderValueType = QuestionBuilderType.NumericText,
		DefaultValue = "100")]
		public int Max = 100;

		[QuestionConfiguration(ConfigurationValueType.Integer,
		DisplayName = "Increment",
		Description = "Range Increment.",
		SurveyBuilderValueType = QuestionBuilderType.NumericText,
		DefaultValue = "10")]
		public int Increment = 10;
	}

}
