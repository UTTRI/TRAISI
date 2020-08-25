using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Traisi.Data.Core;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Traisi.Data;

namespace Traisi.Authorization
{
    /// <summary>
    /// 
    /// </summary>
    /// <typeparam name="SurveyRespondentAuthorizationRequirement"></typeparam>
    public class SurveyRespondentAuthorizationRequirement : IAuthorizationRequirement
    {

        

        public SurveyRespondentAuthorizationRequirement()
        {
   
        }
    }
}