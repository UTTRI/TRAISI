using System;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class SurveyAuthorizationHandlerAttribute : Attribute
    {
        public string Name { get; set; }
    }
}