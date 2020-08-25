using Newtonsoft.Json.Linq;

namespace Traisi.Sdk.Library.ResponseTypes
{
    public interface IJsonResponse : IResponseType
    {
         string Value { get; set; }
    }
}