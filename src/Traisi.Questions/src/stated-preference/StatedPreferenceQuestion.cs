using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    [SurveyQuestion(QuestionResponseType.Json,
    CodeBundleName = "traisi-questions-sp.module.js",
    CustomBuilderCodeBundleName = "traisi-questions-sp-builder.module.js",
    CustomBuilderView = "stated_preference_custom_builder"),
   ]
    public class StatedPreferenceQuestion : ISurveyQuestion
    {
        [QuestionOption(QuestionOptionValueType.KeyValuePair,
        IsMultipleAllowed = true,
            Name = "Response Options",
            Description = "Responce choices for the SP selections.",
            SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
        public ICollection ResponseOptions;

        [QuestionOption(QuestionOptionValueType.String,
        IsMultipleAllowed = true,
            Name = "Row Headers",
            Description = "Row header information",
            SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
        public ICollection<string> RowHeaders;



        public string TypeName
        {
            get => "stated_preference";
        }
        public string Icon
        {
            get => "fas fa-table";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }



    }

}
