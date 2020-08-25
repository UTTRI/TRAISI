using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.None, CodeBundleName = "traisi-questions-general.module.js")]
    public class ContactInformationQuestion : ISurveyQuestion
    {
        [QuestionConfiguration(ConfigurationValueType.Boolean,
        DisplayName = "Collect Email",
        SurveyBuilderValueType = QuestionBuilderType.Switch,
        Description = "Allow the collecction of the respondent e-mail address.",
        DefaultValue = true)]
        public bool AllowCollectEmail = true;

        [QuestionConfiguration(ConfigurationValueType.Boolean,
        DisplayName = "Collect Respondent Name",
        SurveyBuilderValueType = QuestionBuilderType.Switch,
        Description = "Allow the collecction of the respondent name.",
        DefaultValue = true)]
        public bool AllowCollectName = true;

        [QuestionConfiguration(ConfigurationValueType.Boolean,
        DisplayName = "Collect Phone Number",
        SurveyBuilderValueType = QuestionBuilderType.Switch,
        Description = "Allow the collecction of the respondent phone number.",
        DefaultValue = true)]
        public bool AllowCollectPhoneNumber = true;

        public string TypeName => "contact-information";

        public string Icon => "fas fa-id-card";

        public QuestionIconType IconType => QuestionIconType.FONT;
    }
}