using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace Traisi.Surveys.Authentication {

	public class ExternalAuthentication : ISurveyAuthenticationMode {

		public string ModeName { get; set; } = nameof (ExternalAuthentication);

		public string AuthenticationAttribute { get; set; }

		public string AuthenticationUrl { get; set; }

		public void ReadOptions (IConfigurationSection optionsSection) {
			var authAttribute = optionsSection.GetSection ("AuthenticationAttribute").Value;
			AuthenticationAttribute = authAttribute;
			var authUrl = optionsSection.GetSection ("AuthenticationUrl").Value;
			AuthenticationUrl = authUrl;
			return;
		}
	}
}