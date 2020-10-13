using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.OptionSelect, CodeBundleName = "traisi-questions-general.module.js")]
    public class SelectQuestion : ISurveyQuestion
    {
        public string TypeName => "select";

        public string Icon
        {
            get => "fas fa-caret-square-down";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }

        [QuestionOption(QuestionOptionValueType.KeyValuePair,
        IsMultipleAllowed = true,
            Name = "Response Options",
            Description = "The list of available responses presented to the user.",
            SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
        public ICollection ResponseOptions;
    }

}
