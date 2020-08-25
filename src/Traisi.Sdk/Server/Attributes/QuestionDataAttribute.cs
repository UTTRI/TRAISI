using System;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Field)]
    public class QuestionDataAttribute : Attribute
    { 
        public string Name {get; set;}

        public string DataPath {get;set;}

        public QuestionDataAttribute()
        {
            
        }


    }
}