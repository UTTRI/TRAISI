using System;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk.Attributes
{
    /// <summary>
    /// Question Options represent front-end parameters on the builder, that are translatable
    /// </summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class QuestionOptionAttribute : Attribute
    {
        public string Name { get; set; }

        public string Description { get; set; }
        private QuestionOptionValueType _valueType;

        private QuestionOptionValueType _surveyBuilderValueType;

        public QuestionOptionValueType ValueType { get => this._valueType; }

        public QuestionOptionValueType SurveyBuilderValueType { get => this._surveyBuilderValueType; set => this._surveyBuilderValueType = value;}

        public bool IsMultipleAllowed { get; set; } = false;

        public bool IsTranslatable { get; set; } = false;

        public bool IsConfigurationOption {get;set;} = false;

        public QuestionOptionAttribute(QuestionOptionValueType valueType)
        {
            this._valueType = valueType;
        }

    }
}