using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using AspNet.Security.OpenIdConnect.Primitives;
using AutoMapper;
using Traisi.Data;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Interfaces;
using Traisi.ViewModels.Users;
namespace Traisi.Authorization.Extensions
{
    [SurveyAuthorizationHandler(Name = "SAML2")]
    [Route("api/[controller]")]
    public class SAML2AuthorizationHandler : Controller, ITraisiIAuthorizationHandler
    {

        [ExtensionConfiguration(Name = "Sign On URL", Description = "URL of sign on location")]
        public string SignOnURL { get; set; }

        private readonly UserManager<TraisiUser> _userManager;

        private readonly AuthenticationService _authenticationService;

        private readonly IAccountManager _accountManager;

        private readonly IUnitOfWork _unitOfWork;

        private readonly IConfiguration _configuration;

        private readonly string DEFAULT_AUTHENTICATION_ATTRIBUTE = "REMOTE_USER";

        private string AuthenticationAttribute { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userManager"></param>
        public SAML2AuthorizationHandler(UserManager<TraisiUser> userManager,
            AuthenticationService authenticationService,
            IAccountManager accountManager,
            IUnitOfWork unitofWork,
            IConfiguration configuration)
        {
            this._userManager = userManager;
            this._authenticationService = authenticationService;
            this._accountManager = accountManager;
            this._unitOfWork = unitofWork;
            this._configuration = configuration;

            this.Initialize();
        }

        /// <summary>
        /// 
        /// </summary>
        private void Initialize()
        {
            var authAttribute = _configuration.GetValue<string>("SAML2Authentication:AuthenticationAttribute");
            if (authAttribute == null)
            {
                AuthenticationAttribute = DEFAULT_AUTHENTICATION_ATTRIBUTE;
            }
            else
            {
                AuthenticationAttribute = authAttribute;
            }
        }

        /// <summary>
        /// Pulls confiugration to test if this survey is anonymous.
        /// </summary>
        /// <param name="surveyCode"></param>
        /// <returns></returns>
        private bool IsSurveyAnonymous(string surveyCode)
        {
            var modes = _configuration.GetSection("SurveyAuthenticationModes");
            foreach (var mode in modes.GetChildren())
            {
                if (mode.GetValue<string>("SurveyCode") == surveyCode)
                {
                    if (mode.GetValue<bool>("AllowAnonymous"))
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyCode"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("session/{surveyCode}")]
        public ActionResult Session(string surveyCode)
        {
            var headers = Request.HttpContext.Request.Headers;
            return new OkObjectResult(headers);
        }

        /// <summary>
        /// Will login anonymously if the configuration allows this survey code to be anonymous.
        /// </summary>
        /// <param name="surveyCode"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("login/anonymous/{surveyCode}")]
        public async Task<IActionResult> AnonymousLogin(string surveyCode)
        {
            if (!IsSurveyAnonymous(surveyCode))
            {
                return Unauthorized();
            }
            var identifier = HashIdentifier(Guid.NewGuid().ToString());
            var survey = await this._unitOfWork.Surveys.GetSurveyByCodeAsync(surveyCode);
            if (survey == null)
            {
                return new NotFoundResult();
            }
            Shortcode shortcode = new Shortcode()
            {
                Survey = survey,
                Code = identifier,
                IsTest = false,
                CreatedDate = DateTime.UtcNow
            };

            await this._unitOfWork.Shortcodes.AddAsync(shortcode);
            await this._unitOfWork.SaveChangesAsync();

            var queryString = "";
            foreach (var param in HttpContext.Request.Query)
            {
                queryString += $"{param.Key}={param.Value}&";
            }
            if (queryString.Length == 0)
            {
                return Redirect($"/survey/{surveyCode}/start/{HttpUtility.UrlEncode(shortcode.Code)}");
            }
            else
            {
                return Redirect($"/survey/{surveyCode}/start/{HttpUtility.UrlEncode(shortcode.Code)}?{queryString}");
            }

        }



        /// <summary>
        /// Performs a login action.
        /// </summary>
        /// <param name="surveyCode"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("login/{surveyCode}")]
        public async Task<IActionResult> Login(string surveyCode)
        {

            var headers = Request.HttpContext.Request.Headers;
            var identifiers = headers[this.AuthenticationAttribute];
            string identifier = "";

            if (identifiers.Count == 0 || string.IsNullOrEmpty(identifiers[0].Trim()) || IsSurveyAnonymous(surveyCode))
            {

                identifier = Guid.NewGuid().ToString();
            }
            else
            {
                identifier = identifiers[0];
            }
            identifier = HashIdentifier(identifier);

            var survey = await this._unitOfWork.Surveys.GetSurveyByCodeAsync(surveyCode);
            if (survey == null)
            {
                return new NotFoundResult();
            }
            Shortcode shortcode = await this._unitOfWork.Shortcodes.GetShortcodeForSurveyAsync(survey, identifier);
            if (shortcode == null)
            {

                shortcode = new Shortcode()
                {
                    Survey = survey,
                    Code = identifier,
                    IsTest = false,
                    CreatedDate = DateTime.UtcNow
                };

                await this._unitOfWork.Shortcodes.AddAsync(shortcode);
                await this._unitOfWork.SaveChangesAsync();
            }

            return Redirect($"/survey/{surveyCode}/start/{HttpUtility.UrlEncode(shortcode.Code)}");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="identifier"></param>
        /// <returns></returns>
        private static string HashIdentifier(string identifier)
        {
            HashAlgorithm algorithm = SHA256.Create();
            var bytes = algorithm.ComputeHash(Encoding.UTF8.GetBytes(identifier));
            return BitConverter.ToString(bytes).Replace("-", string.Empty);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        [ApiExplorerSettings(IgnoreApi = true)]
        [NonAction]
        public bool ShouldAuthorize(HttpContext s)
        {
            throw new NotImplementedException();
        }
    }

}