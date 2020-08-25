using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    public class DecimalResponse : ResponseValue, IDecimalResponse
    {
        public double Value { get; set; }

    }
}