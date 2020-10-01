using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traisi.Data.Models.Surveys {
	/// <summary>
	/// Primary Respondent type for surveys.
	/// </summary>
	public class PrimaryRespondent : SurveyRespondent {

		public Shortcode Shortcode { get; set; }
		public Groupcode Groupcode { get; set; }
		public ApplicationUser User { get; set; }
		public List<SurveyAccessRecord> SurveyAccessRecords { get; set; }

		public DateTimeOffset SurveyAccessDateTime { get; set; }
		public Survey Survey { get; set; }

		public PrimaryRespondent () {
			this.SurveyAccessRecords = new List<SurveyAccessRecord> ();
		}
	}
}