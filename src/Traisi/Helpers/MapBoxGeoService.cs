using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using RestSharp;
using Traisi.Helpers.Interfaces;

namespace Traisi.Helpers
{
	public class MapboxGeoService : IGeoServiceProvider
	{

		private static readonly string MAPBOX_DISTANCE_MATRIX_API = "https://api.mapbox.com/directions-matrix/v1/mapbox/";
		private GeoConfig _config;
		private RestClient _mapboxApiClient;

		// private static readonly string MAPBOX_MODE_DRIVING = "driving";
		// private static readonly string GOOGLE_MODE_WALKING = "walking";
		// private static readonly string GOOGLE_MODE_BICYCLING = "ciclying";

		/// <summary>
		/// 
		/// </summary>
		/// <param name="config"></param>
		public MapboxGeoService(IOptions<GeoConfig> config)
		{
			_config = config.Value;
			this._mapboxApiClient = new RestClient(MAPBOX_DISTANCE_MATRIX_API);
		}

        public Task<Tuple<double, double>> GeocodeAsync(string address)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="origins"></param>
        /// <param name="destinations"></param>
        /// <returns></returns>
        Task<Dictionary<string, string>> IGeoServiceProvider.DistanceMatrix(List<string> origins, List<string> destinations)
		{
			throw new System.NotImplementedException();
		}

        Task<JObject> IGeoServiceProvider.ReverseGeocodeAsync(double latitude, double longitude)
        {
            throw new NotImplementedException();
        }
    }
}
