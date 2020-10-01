using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.GeoServices
{
    public interface IGeocodeResult
    {
        double Latitude { get; set; }

        double Longitude { get; set; }

        Address Address { get; set; }
    }
}