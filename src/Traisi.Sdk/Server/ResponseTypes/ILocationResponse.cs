using NetTopologySuite.Geometries;

namespace Traisi.Sdk.Library.ResponseTypes
{
    public interface ILocationResponse : IResponseType
    {
        Point Location {get;set;}

        string Address { get; set; }
    }
}