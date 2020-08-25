using System;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Field)]
    public class HasResourceAttribute : Attribute
    {

        public string ResourceName{get;set;}

        public HasResourceAttribute(string resourceName)
        {
            ResourceName = resourceName;
        }

    }
}