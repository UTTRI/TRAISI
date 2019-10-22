﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Geocoding;
using Geocoding.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using RestSharp;
using TRAISI.Helpers;
using TRAISI.Helpers.Interfaces;
using TRAISI.SDK.GeoServices;
using TRAISI.ViewModels;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TRAISI.Controllers
{
	// [Authorize]
	[Route("api/[controller]")]
	public class GeoServiceController : Controller
	{
		private readonly IGeoServiceProvider _geoService;

		private readonly RestClient _triplinx;

		public GeoServiceController(IGeoServiceProvider geoService)
		{
			this._geoService = geoService;

			this._triplinx = new RestClient("https://api.triplinx.cityway.ca/api/journeyplanner/opt");

		}

		// GET: api/<controller>
		[HttpGet]
		[Route("reversegeo/{lat}/{lng}")]
		[Produces(typeof(IGeocodeResult))]
		public async Task<IActionResult> ReverseGeocode(double lat, double lng)
		{
			var address = await this._geoService.ReverseGeocodeAsync(lat, lng);
			GeocodeResult result = new GeocodeResult() { Latitude = lat, Longitude = lng, Address = address };
			return Ok(result);
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="origins"></param>
		/// <param name="destiations"></param>
		/// <returns></returns>
		[HttpGet]
		[Route("distancematrix")]
		public async Task<IActionResult> DistanceMatrix([FromQuery] List<string> origins, [FromQuery] List<string> destinations)
		{

			var result = await this._geoService.DistanceMatrix(origins, destinations);
			return new OkObjectResult(result);
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="arrival"></param>
		/// <param name="departure"></param>
		/// <param name="date"></param>
		/// <param name="mode"></param>
		/// <param name="accessibiliy"></param>
		/// <param name="transitModes"></param>
		/// <returns></returns>
		[HttpGet]
		[Route("routeplanner")]
		public async Task<IActionResult> RoutePlanner([FromQuery] string arrival, [FromQuery] string departure, [FromQuery] string date,
		[FromQuery] string mode, [FromQuery] string transitModes = "", [FromQuery] string accessibiliy = "")
		{

			string[] depCoords = departure.Split("|");
			string[] arrCoords = arrival.Split("|");

			var request = new RestRequest("PlanTrips/json", Method.GET);
			request.AddParameter("user_key", "e447b4a0ad00018a370c7ab0760e3cfd");
			request.AddParameter("DepartureLatitude", depCoords[0]);
			request.AddParameter("DepartureLongitude", depCoords[1]);
			request.AddParameter("DepartureType", "COORDINATES");
			request.AddParameter("ArrivalType", "COORDINATES");
			request.AddParameter("ArrivalLatitude", arrCoords[0]);
			request.AddParameter("ArrivalLongitude", arrCoords[1]);
			request.AddParameter("TripModes", mode);
			request.AddParameter("Date", date);

			if (!string.IsNullOrEmpty(transitModes) && transitModes.Trim().Length > 0)
			{
				request.AddParameter("Modes", transitModes.Trim());
			}

			request.AddParameter("Accessibility", accessibiliy);
			request.AddParameter("DateType", "DEPARTURE");
			request.AddParameter("Algorithm", "FASTEST");

			var response = await _triplinx.ExecuteGetTaskAsync(request);


			return new OkObjectResult(response.Content);
		}

	}
}