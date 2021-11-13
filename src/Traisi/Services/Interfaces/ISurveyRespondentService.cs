using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Core;
using Traisi.Sdk;
using Microsoft.AspNetCore.Http;
using Traisi.Data.Models;

namespace Traisi.Services.Interfaces
{
    public interface ISurveyRespondentService 
    {
        public Task<PrimaryRespondent> CreatePrimaryRespondentForUser(ApplicationUser user, Survey survey, Shortcode shortcodeRef);
    }
}
