using System;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    /// <summary>
    /// 
    /// </summary>
    public class DateTimeResponse : ResponseValue, IDateTimeResponse
    {
       public DateTimeOffset Value {get;set;}
    }
}