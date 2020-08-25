using System;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Class)]
    public class QuestionPartSlotAttribute: Attribute
    {

        /// <summary>
        /// The name of the question slot for the question builder
        /// </summary>
        /// <returns></returns>

        public string SlotName { get; set; }


        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string Description {get;set;}



        /// <summary>
        /// The slot number to house the question part child
        /// </summary>
        /// <value></value>
        public int SlotOrder{get;set;} = 0;


        /// <summary>
        /// Limits the Slot Question Type when this is set
        /// </summary>
        /// <returns></returns>
        public QuestionResponseType SlotQuestionType {get;set;}


        public QuestionPartSlotAttribute()
        {

        }

    }
}