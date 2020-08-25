using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
	[SurveyQuestion(QuestionResponseType.DateTime, CodeBundleName = "traisi-questions-general.module.js",
	ResponseValidator = typeof(DateQuestionValidator))]
    public class TimeQuestion : ISurveyQuestion
    {
        public string TypeName => "Time";

        public string Icon
        {
            get => "far fa-clock";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }
    }

}
