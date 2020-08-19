using System;
using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    [SurveyQuestion(QuestionResponseType.None, CodeBundleName = "traisi-questions-travel-diary.module.js")]
    public class TravelDiaryQuestion : ISurveyQuestion
    {

        public string TypeName
        {
            get => "travel-diary";
        }
        public string Icon
        {
            get => "fas fa-map-marked-alt";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }

        /// <summary>
        /// The minimum or earliest allowed date
        /// </summary>
        [QuestionConfiguration(ConfigurationValueType.Date,
        DisplayName = "TimeStart",
        Description = "The start time of each day.",
        SurveyBuilderValueType = QuestionBuilderType.Date,
        DefaultValue = "1/1/2018 4:00AM")]
        public DateTime MinDate;

        [QuestionConfiguration(ConfigurationValueType.Custom,
    DisplayName = "Purpose",
    Description = "Purpose of being at location.",
    SurveyBuilderValueType = QuestionBuilderType.MultiSelect,
    DefaultValue = "home",
    SharedResource = "mapquestion-purpose")]
        public string[] Purposes = new string[] { };

    }

}