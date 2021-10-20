using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.Interfaces;

namespace Traisi.Data.Models.Surveys {
	/// <summary>
	/// Label items, store most alterable and dynamic text fields.
	/// </summary>
	public class SurveyAccessRecord : ISurveyAccessRecord {

		public int Id { get; set; }

		[Column (TypeName = "jsonb")]
		public Dictionary<string,string> QueryParams { get; set; }
		public DateTimeOffset AccessDateTime { get; set; }
		public string UserAgent { get; set; }
		public string RemoteIpAddress { get; set; }
		public string RequestUrl { get; set; }
		public PrimaryRespondent Respondent { get; set; }
		public ApplicationUser AccessUser { get; set; }

	}
}