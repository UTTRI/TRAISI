using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
namespace Traisi.Authorization
{
    /// <summary>
    /// Authorization filter for access restricted to users of the respondent type. 
    /// This filter compares claims for the current user with the associated survey id and assigned shortcode.
    /// These values should match provided header values.
    /// </summary>
    public class SurveyUserAuthorizationFilter : Microsoft.AspNetCore.Mvc.Filters.IAuthorizationFilter
    {


        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        public void OnAuthorization(AuthorizationFilterContext context)
        {

            var claims = context.HttpContext.User.Claims.ToList();
            var headers = context.HttpContext.Request.Headers;


            if (!headers.ContainsKey("Survey-Id") || !headers.ContainsKey("Shortcode") ||
                !claims.Exists(c => c.Type == "SurveyId") || !claims.Exists(c => c.Type == "Shortcode"))
            {
                context.Result = new UnauthorizedResult();
            }

            if (headers["Survey-Id"].Single() != claims.Single(c => c.Type == "SurveyId").Value || headers["Shortcode"].Single() != claims.Single(c => c.Type == "Shortcode").Value)
            {
                context.Result = new UnauthorizedResult();
            }
            return;
        }
    }

    public class SurveyUserAuthorizationAttribute : TypeFilterAttribute
    {
        public SurveyUserAuthorizationAttribute() : base(typeof(SurveyUserAuthorizationFilter))
        {

        }
    }
}