using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Core;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Models.Surveys
{
    public class Shortcode
    {
        public int Id { get; set; }
        public Survey Survey { get; set; }
        //	public PrimaryRespondent Respondent { get; set; }
        public Groupcode Groupcode { get; set; }
        public string Code { get; set; }
        public Boolean IsTest { get; set; }
        public DateTime CreatedDate { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <value></value>
        public Boolean SurveyCompleted { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <value></value>
        public bool SurveyRejected { get; set; }
    }

}