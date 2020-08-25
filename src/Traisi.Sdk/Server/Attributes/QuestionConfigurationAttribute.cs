using System;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
    public class QuestionConfigurationAttribute : Attribute
    {
        public string DisplayName { get; set; }

        public string Description { get; set; }

        private ConfigurationValueType _valueType;

        private QuestionBuilderType _surveyBuilderValueType;

        public ConfigurationValueType ValueType { get => this._valueType; }

        public QuestionBuilderType SurveyBuilderValueType { get => _surveyBuilderValueType; set => _surveyBuilderValueType = value; }

        /// <summary>
        /// A resource (name) that is required for the configuration. This field points specifically to locally referenced resources. After loading,
        /// the resource information is made global to other questions that reference it.
        /// </summary>
        /// <value></value>
        public string Resource { get; set; }

        /// <summary>
        /// A resource (name) that is required for the configuration. This field points specifically to locally referenced resources. This
        /// resource type differs from the standard 'Resource' by making the loaded data only available to this question / extension.
        /// </summary>
        /// <value></value>
        public string PrivateResource { get; set; }

        /// <summary>
        /// A shared resource indicates the identifier passed here refers to data that is created externally.
        /// </summary>
        /// <value></value>
        public string SharedResource { get; set; }

        public object DefaultValue { get; set; }
        
        public QuestionConfigurationAttribute(ConfigurationValueType valueType)
        {
            this._valueType = valueType;
        }

        /// <summary>
        /// Determines whether or not this configuration has multiple translation values
        /// </summary>
        /// <value></value>
        public bool IsTranslatable { get; set; }

    }
}