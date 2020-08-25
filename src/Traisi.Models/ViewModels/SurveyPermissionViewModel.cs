using System;
using System.Linq;

namespace Traisi.ViewModels
{
    public class SurveyPermissionViewModel
    {
				public int Id { get; set; }
        public string UserId { get; set; }
				public int SurveyId { get; set; }
				public string[] Permissions { get; set; }
    }
}