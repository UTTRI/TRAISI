using System;
using System.IO;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Interfaces;
using System.Collections.Generic;

namespace Traisi.Sdk
{
    /// <summary>
    /// Contains the definition for a specific question type - path location and other meta info.
    /// </summary>
    public class QuestionPartSlotDefinition
    {

        public string Name {get;set;}

        public string Description{get;set;}

        public int SlotOrder{get;set;}

    }

}