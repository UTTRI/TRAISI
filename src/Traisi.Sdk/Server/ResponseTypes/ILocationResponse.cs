using NetTopologySuite.Geometries;
using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.Library.ResponseTypes
{
    public interface ILocationResponse : IResponseType
    {
        Point Location {get;set;}

        Address Address { get; set; }
    }
}