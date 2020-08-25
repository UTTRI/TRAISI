using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Traisi.Helpers.Interfaces
{
    public interface IGeoServiceProvider
    {

		
		/// <summary>
		/// 
		/// </summary>
		/// <param name="latitude"></param>
		/// <param name="longitude"></param>
		/// <returns></returns>
		Task<JObject> ReverseGeocodeAsync(double latitude, double longitude);

		/// <summary>
		/// 
		/// </summary>
		/// <param name="origins"></param>
		/// <param name="destinations"></param>
		/// <returns></returns>
		Task<Dictionary<string, string>> DistanceMatrix(List<string> origins, List<string> destinations);

		/// <summary>
		/// 
		/// </summary>
		/// <param name="address"></param>
		/// <returns></returns>
		Task<Tuple<double,double>> GeocodeAsync(string address);
    }
}