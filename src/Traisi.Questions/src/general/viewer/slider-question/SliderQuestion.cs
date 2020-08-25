using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.Number, CodeBundleName = "traisi-questions-general.module.js",
    ResponseValidator = typeof(NumberQuestionValidator))]
    public class SliderQuestion : ISurveyQuestion
    {
        public string TypeName => "slider";

        public string Icon
        {
            get => "fas fa-sliders-h";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }


        public string Format = "Decimal";

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
        DisplayName = "Step",
        Description = "Slider Step.",
        SurveyBuilderValueType = QuestionBuilderType.NumericText,
        DefaultValue = "5")]
        public int Step = 5;
    }

}
