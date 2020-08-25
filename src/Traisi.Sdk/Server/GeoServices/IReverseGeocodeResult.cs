namespace Traisi.Sdk.GeoServices
{
    public interface IGeocodeResult
    {
        double Latitude { get; set; }

        double Longitude { get; set; }

        object Address { get; set; }
    }
}