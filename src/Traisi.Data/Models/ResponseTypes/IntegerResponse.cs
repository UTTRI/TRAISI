using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    public class IntegerResponse : ResponseValue, IIntegerResponse
    {
   
        public int Value { get; set; }

    }
}