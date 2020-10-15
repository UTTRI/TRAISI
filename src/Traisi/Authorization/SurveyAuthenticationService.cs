using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Traisi.Surveys.Authentication;

namespace Traisi.Authorization {
	public class SurveyAuthenticationService {

		private readonly IConfiguration _configuration;

		public Dictionary<string, ISurveyAuthenticationMode> SurveyAuthenticationModes { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <param name="signInManager"></param>
		/// <param name="userManager"></param>
		/// <param name="accountManager"></param>
		public SurveyAuthenticationService (

			IConfiguration configuration) {
			this._configuration = configuration;

			this.InitializeSurveyAuthModes ();
		}

		private void InitializeSurveyAuthModes () {
			SurveyAuthenticationModes = new Dictionary<string, ISurveyAuthenticationMode> ();

			var authModes = _configuration.GetSection ("SurveyAuthenticationModes").GetChildren ();
			foreach (var section in authModes) {
				string code = section.GetValue<string> ("SurveyCode");
				string mode = section.GetValue<string> ("AuthenticationMode");
				var options = section.GetSection ("Options");

				var type = Type.GetType (mode+", Traisi.Models");
				if (type == null) {
					continue;
				}
				if (type != null) {
					var authMode = (ISurveyAuthenticationMode) Activator.CreateInstance (type);
					authMode.ReadOptions (options);
					this.SurveyAuthenticationModes[code] = authMode;
				}

			}
			return;

		}

	}

}