using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using RestSharp;
using Traisi.Helpers.Interfaces;

namespace Traisi.Helpers
{
    public class GeocodeGeoService : IGeoServiceProvider
    {

        private static readonly string GEOCODER_API_URL = "https://geocoder.ca/";
        private GeoConfig _config;

        private readonly string _apiKey;

        private readonly RestClient _geocodeClient;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="config"></param>
        public GeocodeGeoService(IOptions<GeoConfig> config)
        {
            _config = config.Value;
            this._apiKey = _config.APIKey;

            this._geocodeClient = new RestClient(GEOCODER_API_URL);
        }

		/// <summary>
		/// 
		/// </summary>
		/// <param name="address"></param>
		/// <returns></returns>
        public async Task<Tuple<double, double>> GeocodeAsync(string address)
        {
            var request = new RestRequest(Method.GET);
            request.AddParameter("locate", address);
            request.AddParameter("json", 1);
            request.AddParameter("auth", this._apiKey);

            var response = await this._geocodeClient.ExecuteAsync(request);

            return null;
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

        /// <summary>
        /// 
        /// </summary>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <returns></returns>
        public async Task<JObject> ReverseGeocodeAsync(double latitude, double longitude)
        {
            var request = new RestRequest(Method.GET);
            request.AddParameter("latt", latitude);
            request.AddParameter("longt", longitude);
            request.AddParameter("json", 1);
            request.AddParameter("reverse", 1);
            request.AddParameter("auth", this._apiKey);
            var response = await this._geocodeClient.ExecuteAsync(request);
            var content = Newtonsoft.Json.Linq.JObject.Parse(response.Content);
            return content;
        }

    }
}
