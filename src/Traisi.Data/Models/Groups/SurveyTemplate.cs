using System;
using System.Collections.Generic;
using System.Text;

namespace Traisi.Data.Models.Groups
{
    public class SurveyTemplate: AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string HTML { get; set; }
		public string CSS { get; set; }
        public UserGroup Group { get; set; }
    }
}
