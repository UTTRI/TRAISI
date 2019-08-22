using System.Collections;
using System.Collections.Generic;
using TRAISI.SDK.Attributes;
using TRAISI.SDK.Enums;
using TRAISI.SDK.Interfaces;


namespace TRAISI.SDK.Questions
{
    [SurveyQuestion(QuestionResponseType.OptionSelect, CodeBundleName = "traisi-questions-general.module.js")]
    public class RadioQuestion : ISurveyQuestion
    {
        public string TypeName => "radio";

        public string Icon
        {
            get => "far fa-dot-circle";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }

        [QuestionOption(QuestionOptionValueType.KeyValuePair,
        IsMultipleAllowed = true,
            Name = "Response Options",
            Description = "The list of available radio responses presented to the user.",
            SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
        public ICollection ResponseOptions;

        [QuestionConfiguration(ConfigurationValueType.Boolean,
        Name = "AllowCustomResponse",
        Description = "Allow user to enter their own custom response.",
        SurveyBuilderValueType = QuestionBuilderType.Switch,
        DefaultValue = "false")]
        public int Min = 0;
    }

}
