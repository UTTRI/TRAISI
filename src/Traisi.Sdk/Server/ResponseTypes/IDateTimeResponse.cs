using System;

namespace Traisi.Sdk.Library.ResponseTypes
{
    public interface IDateTimeResponse : IResponseType
    {
        DateTimeOffset Value { get; set; }
    }
}