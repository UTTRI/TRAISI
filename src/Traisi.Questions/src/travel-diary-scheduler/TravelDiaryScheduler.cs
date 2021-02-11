using System;
using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    [SurveyQuestion(QuestionResponseType.Timeline, CodeBundleName = "traisi-questions-travel-diary-scheduler.module.js")]
    public class TravelDiaryScheduler : ISurveyQuestion
    {

        public string TypeName => "travel-diary-scheduler";

        public string Icon => "fas fa-map-marked-alt";

        public QuestionIconType IconType => QuestionIconType.FONT; 


        [QuestionConfiguration(ConfigurationValueType.Custom,
        DisplayName = "Mode",
        Description = "What travel modes are available.",
        SurveyBuilderValueType = QuestionBuilderType.MultiSelect,
        Resource = "traveldiary-modes")]
        public string[] Modes;

        [QuestionConfiguration(ConfigurationValueType.Custom,
       DisplayName = "Purpose",
       Description = "Purpose of being at location.",
       SurveyBuilderValueType = QuestionBuilderType.MultiSelect,
       DefaultValue = "home",
       SharedResource = "mapquestion-purpose")]
        public string[] Purposes;

        [QuestionConfiguration(ConfigurationValueType.Response,
        DisplayName = "School Locations",
        Description = "Which question IDs indicates the location of the respondent's school locations.",
        SurveyBuilderValueType = QuestionBuilderType.MultiSelect)]
        public int[] SchoolLocationIds;


        [QuestionConfiguration(ConfigurationValueType.Response,
        DisplayName = "Work Locations",
        Description = "Which question IDs indicates the location of the respondent's work locations.",
        SurveyBuilderValueType = QuestionBuilderType.MultiSelect)]
        public int[] WorkLocationids;

    }
}