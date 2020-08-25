using System;
using System.IO;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Interfaces;
using System.Collections.Generic;

namespace Traisi.Sdk
{
    public class QuestionResource
    {
        public string ResourceName { get; set; }

        public byte[] Data { get; set; }

        public string FieldName { get; set; }

    }
}