using System;
using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    [SurveyQuestion(QuestionResponseType.Json, CodeBundleName = "traisi-questions-route-select.module.js")]
    public class RouteSelectQuestion : ISurveyQuestion
    {

        public string TypeName
        {
            get => "route-select";
        }
        public string Icon
        {
            get => "fas fa-route";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }


    }

}
