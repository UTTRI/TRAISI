using System;
using TRAISI.SDK.Enums;

namespace TRAISI.SDK.Attributes
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
    public class ExtensionConfigurationAttribute : Attribute
    {

        public string Name { get; set; }

        public string Description { get; set; }

        public ConfigurationValueType ValueType { get; set; }
    }
}