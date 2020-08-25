using System.Collections.Generic;
using Traisi.Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Traisi.Data.Models.Surveys
{


    public abstract class SurveyRespondent : ISurveyRespondent
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Relationship { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        public bool HasConsent { get; set; }
        public SurveyRespondentGroup SurveyRespondentGroup { get; set; }


    }
}