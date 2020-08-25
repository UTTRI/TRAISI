using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;


namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.Json, CodeBundleName = "traisi-questions-general.module.js")]
    public class MatrixQuestion : ISurveyQuestion
    {
        public string TypeName => "matrix";

        public string Icon
        {
            get => "fas fa-sliders-h";
        }
        public QuestionIconType IconType { get => QuestionIconType.FONT; }

        [QuestionOption(QuestionOptionValueType.KeyValuePair,
        IsMultipleAllowed = true,
            Name = "Row Options",
            Description = "The rows of the matrix presented to the user.",
            SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
        public ICollection RowOptions;

        [QuestionOption(QuestionOptionValueType.KeyValuePair,
        IsMultipleAllowed = true,
            Name = "Column Options",
            Description = "The columns of the matrix presented to the user.",
            SurveyBuilderValueType = QuestionOptionValueType.KeyValuePair)]
        public ICollection ColumnOptions;
    }

}
