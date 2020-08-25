using System.Collections;
using System.Collections.Generic;
using System;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.DateTime, CodeBundleName = "traisi-questions-general.module.js",
    ResponseValidator = typeof(DateQuestionValidator))]
    public class DateQuestion : ISurveyQuestion
    {
        public string TypeName => "Date";

        public string Icon
        {
            get => "far fa-calendar-alt";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }


        /// <summary>
        /// The minimum or earliest allowed date
        /// </summary>
        [QuestionConfiguration(ConfigurationValueType.Date,
        DisplayName = "Min Date",
        Description = "Minimum Date.",
        SurveyBuilderValueType = QuestionBuilderType.Date,
        DefaultValue = "1/1/2018")]
        public DateTime MinDate;

        /// <summary>
        /// the maximum or latest allowed date
        /// </summary>
        [QuestionConfiguration(ConfigurationValueType.Date,
        DisplayName = "Max Date",
        Description = "Maximum Date.",
        SurveyBuilderValueType = QuestionBuilderType.Date,
        DefaultValue = "1/1/2018")]
        public DateTime MaxDate;
    }

}
