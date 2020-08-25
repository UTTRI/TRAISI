using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Geocoding;
using Geocoding.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using RestSharp;
using Traisi.Helpers.Interfaces;

namespace Traisi.Helpers
{

	public class GoogleGeoService : IGeoServiceProvider
	{

		private static readonly string GOOGLE_API_URL = "https://maps.googleapis.com/maps/api";
		private static readonly string GOOGLE_MODE_DRIVING = "driving";
		private static readonly string GOOGLE_MODE_TRANSIT = "transit";
		private static readonly string GOOGLE_MODE_WALKING = "walking";
		private static readonly string GOOGLE_MODE_BICYCLING = "bicycling";

		private static readonly string[] GOOGLE_MODES = new string[] {
			GOOGLE_MODE_DRIVING,
			GOOGLE_MODE_TRANSIT,
			GOOGLE_MODE_WALKING,
			GOOGLE_MODE_BICYCLING
		};

		private readonly IGeocoder _geocoder;
		private GeoConfig _config;
		private readonly RestClient _googleApiClient;

		private IMemoryCache _cache;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="config"></param>
		public GoogleGeoService(IOptions<GeoConfig> config, IMemoryCache memoryCache)
		{
			_config = config.Value;
			this._geocoder = new GoogleGeocoder() { ApiKey = _config.APIKey };
			this._googleApiClient = new RestClient(GOOGLE_API_URL);
			this._cache = memoryCache;


		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="latitude"></param>
		/// <param name="longitude"></param>
		/// <returns></returns>
		public async Task<string> ReverseGeocodeAsync(double latitude, double longitude)
		{
			IEnumerable<Address> result = null;
			try {
				result = await this._geocoder.ReverseGeocodeAsync(latitude, longitude);
				return result.First().FormattedAddress;
			}
			catch(Exception e) {
				
				Console.WriteLine(e);
			}
			
			return result.First().FormattedAddress;
		}


		/// <summary>
		/// /// 
		/// </summary>
		/// <param name="origins"></param>
		/// <param name="destinations"></param>
		/// <returns></returns>
		public async Task<Dictionary<string, string>> DistanceMatrix(List<string> origins, List<string> destinations)
		{
			var apiTasks = new List<Task>();
			Dictionary<string, string> apiResults = new Dictionary<string, string>();
			var resultTask = new TaskCompletionSource<Dictionary<string, string>>();
			foreach (var mode in GOOGLE_MODES)
			{
				var originsString = String.Join("|", origins.ToArray());
				var destinationsString = String.Join("|", destinations.ToArray());
				var modeString = mode;

				var cacheKey = String.Join("_", originsString, destinationsString, modeString);

				var apiTask = await this._cache.GetOrCreateAsync<string>(cacheKey, (entry) =>
				{

					var request = new RestRequest("distancematrix/json", Method.GET);
					request.AddParameter("origins", originsString);
					request.AddParameter("destinations", destinationsString);
					request.AddParameter("key", _config.APIKey);
					request.AddParameter("mode", mode);
					var cacheTask = new TaskCompletionSource<string>();
					_googleApiClient.ExecuteAsync(request, response =>
					{
						// Console.WriteLine(response.Content);
						// apiResults.Add(mode, response.Content);
						cacheTask.SetResult(response.Content);
					});
					return cacheTask.Task;

				});
				_cache.Set(cacheKey, apiTask, TimeSpan.FromDays(7));

				apiResults[mode] = apiTask;


			}

			return apiResults;

		}

        public Task<Tuple<double, double>> GeocodeAsync(string address)
        {
            throw new NotImplementedException();
        }

        Task<JObject> IGeoServiceProvider.ReverseGeocodeAsync(double latitude, double longitude)
        {
            throw new NotImplementedException();
        }
    }

	public class GeoConfig
	{
		public string Provider { get; set; }
		public string APIKey { get; set; }
	}
}