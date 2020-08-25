using System;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
    public class ExtensionConfigurationAttribute : Attribute
    {

        public string Name { get; set; }

        public string Description { get; set; }

        public ConfigurationValueType ValueType { get; set; }
    }
}