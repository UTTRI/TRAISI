using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    public class OptionSelectResponse : ResponseValue, IOptionSelectResponse
    {

        public string Value { get; set; }
        public string Code { get; set; }

    }
}