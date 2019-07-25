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
using TRAISI.Helpers;
using TRAISI.Helpers.Interfaces;
using TRAISI.ViewModels;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TRAISI.Controllers {
    // [Authorize]
    [Route ("api/[controller]")]
    public class GeoServiceController : Controller {
        private readonly IGeoServiceProvider _geoService;

        public GeoServiceController (IGeoServiceProvider geoService) {
            this._geoService = geoService;

        }

        // GET: api/<controller>
        [HttpGet]
        [Route ("reversegeo/{lat}/{lng}")]
        [Produces (typeof (GeoLocationViewModel))]
        public async Task<IActionResult> ReverseGeocode (double lat, double lng) {
            var address = await this._geoService.ReverseGeocodeAsync (lat, lng);
            GeoLocationViewModel result = new GeoLocationViewModel () { Latitude = lat, Longitude = lng, Address = address };
            return Ok (result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="origins"></param>
        /// <param name="destiations"></param>
        /// <returns></returns>
        [HttpGet]
        [Route ("distancematrix")]
        public async Task<IActionResult> DistanceMatrix ([FromQuery] List<string> origins, [FromQuery] List<string> destinations) {

            var result = await this._geoService.DistanceMatrix (origins, destinations);
            return new OkObjectResult (result);
        }

    }
}