using System;
using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    [SurveyQuestion(QuestionResponseType.Timeline, CodeBundleName = "traisi-questions-travel-diary.module.js")]
    public class TravelDiaryLogger : ISurveyQuestion
    {

        public string TypeName
        {
            get => "travel-diary-logger";
        }
        public string Icon
        {
            get => "fas fa-map-marked-alt";
        }

        public QuestionIconType IconType { get => QuestionIconType.FONT; }

    }
}