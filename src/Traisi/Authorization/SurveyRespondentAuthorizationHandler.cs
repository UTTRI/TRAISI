using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Traisi.Data;
using Traisi.Data.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Traisi.Authorization.Enums;

namespace Traisi.Authorization {
	/// <summary>
	/// 
	/// </summary>
	/// <typeparam name="SurveyRespondentAuthorizationRequirement"></typeparam>
	public class SurveyRespondentAuthorizationHandler : AuthorizationHandler<SurveyRespondentAuthorizationRequirement>, IAuthorizationRequirement {

		const string HEADER_KEY_RESPONDENT_ID = "Respondent-Id";
		const string HEADER_KEY_SURVEY_ID = "Survey-Id";
		const string CLAIM_KEY_SHORTCODE = "Shortcode";
		const string CLAIM_KEY_SURVEY_ID = "SurveyId";
		private IUnitOfWork _unitOfWork;

		private IHttpContextAccessor _contextAccessor;
		/// <summary>
		/// 
		/// </summary>
		/// <param name="unitOfWork"></param>
		public SurveyRespondentAuthorizationHandler (IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor) {
			this._unitOfWork = unitOfWork;
			this._contextAccessor = httpContextAccessor;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="context"></param>
		/// <param name="requirement"></param>
		/// <returns></returns>
		/// <exception cref="NotImplementedException"></exception>
		protected override Task HandleRequirementAsync (AuthorizationHandlerContext context, SurveyRespondentAuthorizationRequirement requirement) {

			var user = context.User;

			if (user == null) {
				context.Fail ();
				return Task.CompletedTask;
			} else if (user.IsInRole ("respondent")) {
				return ProcessSurveyUser (context, requirement);
			} else if (context.User.IsInRole (TraisiRoles.SuperAdministrator)) {
				context.Succeed (requirement);
				return Task.CompletedTask;
			} else if (context.User.HasClaim (CustomClaimTypes.SurveyProxyRespondent, "") ||
				context.User.HasClaim (CustomClaimTypes.SurveyRespondent, "")) {
				context.Succeed (requirement);
			}

			context.Succeed (requirement);
			return Task.CompletedTask;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="context"></param>
		/// <param name="requirement"></param>
		private Task ProcessSurveyUser (AuthorizationHandlerContext context, SurveyRespondentAuthorizationRequirement requirement) {

			var user = context.User;
			// get survey id claim
			// match with headers
			var resource = context.Resource;
			var userSurveyId = user.Claims.FirstOrDefault (claim => claim.Type == CLAIM_KEY_SURVEY_ID);
			var userShortcode = user.Claims.FirstOrDefault (claim => claim.Type == CLAIM_KEY_SHORTCODE);

			var headerSurveyId = this._contextAccessor.HttpContext.Request.Headers.
			FirstOrDefault (s => s.Key == HEADER_KEY_SURVEY_ID);

			var headerShortcode = this._contextAccessor.HttpContext.Request.Headers.
			FirstOrDefault (s => s.Key == CLAIM_KEY_SHORTCODE);

			if (headerSurveyId.Value == userSurveyId.Value && headerShortcode.Value == userShortcode.Value) {
				context.Succeed (requirement);
			} else {
				context.Fail ();
			}
			return Task.CompletedTask;
		}
	}
}