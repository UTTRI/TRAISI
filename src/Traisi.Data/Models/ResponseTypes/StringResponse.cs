using System;
using System.ComponentModel.DataAnnotations;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    public class StringResponse : ResponseValue, IStringResponse
    {

        public string Value { get; set; }

    }
}