using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Traisi.Controllers.Constraints
{
	public class RespondentConstraint : IRouteConstraint
	{
		public RespondentConstraint()
		{

		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="httpContext"></param>
		/// <param name="route"></param>
		/// <param name="routeKey"></param>
		/// <param name="values"></param>
		/// <param name="routeDirection"></param>
		/// <returns></returns>
		public bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
		{
			return true;
		}
	}
}