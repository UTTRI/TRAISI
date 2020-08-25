using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Traisi.Authorization;
using Traisi.Surveys.Authentication;

namespace Traisi.Controllers.SurveyViewer {

	[ApiController]
	[Route ("api/[controller]/")]
	public class SurveyAuthenticationController : ControllerBase {

		private readonly IConfiguration _configuration;

		private static readonly TraisiAuthentication TRAISI_AUTHENTICATION = new TraisiAuthentication ();

		private readonly SurveyAuthenticationService _surveyAuthenticationService;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="configuration"></param>
		public SurveyAuthenticationController (IConfiguration configuration, SurveyAuthenticationService service) {
			this._configuration = configuration;
			this._surveyAuthenticationService = service;

		}

		/// <summary>
		/// Read authorization modes and their data from the configuration
		/// </summary>

		/// <summary>
		/// 
		/// </summary>
		/// <param name="surveyId"></param>
		/// <returns></returns>
		/// 
		[HttpGet]
		[Route ("authentication-mode/{surveyCode}")]
		public IActionResult GetSurveyAuthenticationMode (string surveyCode) {

			if (this._surveyAuthenticationService.SurveyAuthenticationModes.ContainsKey (surveyCode)) {
				return new OkObjectResult (this._surveyAuthenticationService.SurveyAuthenticationModes[surveyCode]);
			} else {
				return new OkObjectResult (TRAISI_AUTHENTICATION);
			}

		}

	}

}