using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.None, CodeBundleName = "traisi-questions-general.module.js")]
    public class HouseholdQuestion : ISurveyQuestion
    {
        public string TypeName => "household";

        public string Icon => "fas fa-home";

        public QuestionIconType IconType => QuestionIconType.FONT;
    }
}