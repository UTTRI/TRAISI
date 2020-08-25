using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Traisi.Helpers.Interfaces;

namespace Traisi.Services.Geo
{
    /// <summary>
    /// GeoServiceProvider for Geocoder.ca
    /// </summary>
    public class Geocoder : IGeoServiceProvider
    {
        public Task<Dictionary<string, string>> DistanceMatrix(List<string> origins, List<string> destinations)
        {
            throw new NotImplementedException();
        }

        public Task<Tuple<double, double>> GeocodeAsync(string address)
        {
            throw new NotImplementedException();
        }

        public Task<JObject> ReverseGeocodeAsync(double latitude, double longitude)
        {
            throw new NotImplementedException();
        }
    }
}