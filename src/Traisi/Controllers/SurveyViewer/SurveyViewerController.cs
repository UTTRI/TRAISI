using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Threading.Tasks;
using AutoMapper;
using CryptoHelper;
using Traisi.Data;
using Traisi.Data.Core;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Traisi.Authorization;
using Traisi.Helpers;
using Traisi.Sdk.Interfaces;
using Traisi.Services.Interfaces;
using Traisi.ViewModels;
using Traisi.ViewModels.Extensions;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.Controllers.SurveyViewer
{
    public class TestAttribute : Attribute
    {

    }

    [Route("api/[controller]")]
    public class SurveyViewerController : Controller
    {
        private IUnitOfWork _unitOfWork;

        private ISurveyViewerService _viewService;

        private IAccountManager _accountManager;

        private ISurveyBuilderService _builderService;

        private IQuestionTypeManager _manager;

        private UserManager<ApplicationUser> _userManager;

        private readonly IConfiguration _configuration;

        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IMapper _mapper;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="viewService"></param>
        /// <param name="accountManager"></param>
        /// <param name="unitOfWork"></param>
        /// <param name="builderService"></param>
        /// <param name="manager"></param>
        /// <param name="userManager"></param>
        /// <param name="configuration"></param>
        public SurveyViewerController(ISurveyViewerService viewService,
            IAccountManager accountManager,
            IUnitOfWork unitOfWork,
            ISurveyBuilderService builderService,
            IQuestionTypeManager manager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            IHttpContextAccessor accessor,
            IMapper mapper
        )
        {
            this._unitOfWork = unitOfWork;
            this._viewService = viewService;
            this._accountManager = accountManager;
            this._builderService = builderService;
            this._manager = manager;
            this._userManager = userManager;
            this._configuration = configuration;
            this._contextAccessor = accessor;
            this._mapper = mapper;
        }

        /// <summary>
        /// Return all questions for a given survey view.
        /// </summary>
        [HttpGet]
        [Produces(typeof(List<SurveyView>))]
        [Route("views/{surveyId}")]
        public async Task<IActionResult> GetSurveyViews(int surveyId)
        {
            var surveys = await this._unitOfWork.SurveyViews.GetSurveyViews(surveyId);

            return new ObjectResult(surveys);
        }

        [HttpGet]
        [Produces(typeof(int))]
        [Route("codes/{code}")]
        public async Task<IActionResult> GetSurveyFromCode(string code)
        {
            var survey = await this._viewService.GetSurveyFromCode(code);

            if (survey != null)
            {
                return new ObjectResult((surveyId: survey.Id, surveyTitle: survey.TitleLabels.Default.Value, nameof: survey.Name));
            }
            else
            {
                return new NotFoundResult();
            }
        }

        /// <summary>
        /// Return all questions for a given survey view.
        /// </summary>
        [HttpGet]
        [Authorize]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(List<SurveyView>))]
        [Route("questions/{viewId}")]
        public async Task<IActionResult> GetSurveyViewQuestions(int viewId)
        {
            var surveys = await this._unitOfWork.SurveyViews.GetAsync(viewId);
            return new ObjectResult(surveys);
        }

        /// <summary>
        /// Return all questions for a given survey view.
        /// </summary>
        [HttpGet]
        [Authorize]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(List<SurveyViewPageViewModel>))]
        [Route("surveys/{surveyId}/")]
        public async Task<IActionResult> GetSurveyViewPages(int surveyId, [FromQuery] SurveyViewType viewType = SurveyViewType.RespondentView, [FromQuery] string language = "en")
        {
            List<QuestionPartView> pages = await this._viewService.GetSurveyViewPages(surveyId, viewType);
            var localizedModel = pages.ToLocalizedModel<List<SurveyViewPageViewModel>, QuestionPartView>(_mapper,language);
            return new ObjectResult(localizedModel);
        }

        /// <summary>
        /// Retrieves a question configuration.
        /// </summary>
        /// <param name="questionId"></param>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(QuestionConfiguration))]
        [Route("configurations/{questionId}")]
        public async Task<IActionResult> GetSurveyViewQuestionConfiguration(int questionId)
        {
            var QuestionPart = await this._unitOfWork.QuestionParts.GetAsync(questionId);
            return new ObjectResult(QuestionPart.QuestionOptions);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(List<QuestionOptionsViewModel>))]
        [Route("surveys/{surveyId}/questions/{questionId}/options/")]
        public async Task<IActionResult> GetQuestionOptions(int surveyId, int questionId, [FromQuery] string query = null, [FromQuery] string language = "en")
        {
            var questionOptions = await this._viewService.GetQuestionOptions(questionId);

            var localizedModel = questionOptions.ToLocalizedModel<List<QuestionOptionViewModel>, QuestionOption>(_mapper,language);

            return new ObjectResult(localizedModel);
        }

        /// <summary>
        /// Retrives a survey's required information to create the survey viewer
        /// </summary>
        /// <param name="surveyId">The ID of the survey</param>
        /// <param name="viewId">The ID of the view, or 0 for default</param>
        /// <param name="language">The language of the survey, or null for default</param>
        /// <returns>Returns the SurveyViewer View Model</returns>
        [HttpGet]
        [Produces(typeof(SurveyViewerViewModel))]
        [Route("view/{surveyId}")]
        public async Task<IActionResult> GetDefaultSurveyView(int surveyId, string language = "en")
        {
            var view = await this._viewService.GetDefaultSurveyView(surveyId);
            return new ObjectResult(view.ToLocalizedModel<SurveyViewerViewModel>(_mapper,language));
        }

        [HttpGet("styles/{surveyId}")]
        [Produces(typeof(string))]
        public async Task<IActionResult> GetSurveyStyles(int surveyId)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(surveyId);
            if (survey == null)
            {
                return new NotFoundResult();
            }
            return Ok(survey.StyleTemplate);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        [Produces(typeof(bool))]
        [HttpPost]
        [Route("start/{surveyId}/{shortcode}")]
        public async Task<IActionResult> StartSurvey(int surveyId, string shortcode)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(surveyId);
            if (survey == null)
            {
                return new NotFoundResult();
            }
            bool success = await this._viewService.SurveyLogin(survey, shortcode.Trim(), User);

            if (!success)
            {
                return new UnauthorizedResult();
            }

            // save changes for survey access records
            await _unitOfWork.SaveChangesAsync();
            return new OkResult();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("start/{surveyId}/groupcode/{groupcode}")]
        public async Task<IActionResult> StartSurveyWithGroupcode(int surveyId,
            string groupcode, [FromHeader(Name = "User-Agent")] string userAgent, [FromBody] JObject queryParams)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(surveyId);
            bool success = await this._viewService.SurveyGroupcodeLogin(survey, groupcode, User, userAgent, queryParams, this._contextAccessor);

            if (!success)
            {
                return new BadRequestObjectResult(new SurveyViewerShortcodeViewModel()
                {
                    Success = false
                });
            }

            return new OkObjectResult(new SurveyViewerShortcodeViewModel()
            {
                Success = true
            });
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [Route("welcome/{name}")]
        [HttpGet]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> GetSurveyWelcomeView(string name)
        {
            var result = await this._viewService.GetSurveyWelcomeView(name);
            if (result == null)
            {
                return new NotFoundResult();
            }

            return new ObjectResult(result);
        }

        /// <summary>
        /// Validates the pairing of the associated groupcode and survey id. This will return true if
        /// the specified survey exists with the passed groupcode.
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="groupcode"></param>
        /// <returns></returns>
        [Route("surveys/{surveyId}/groupcodes/{groupcode}/validate")]
        [HttpGet]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> ValidateSurveyGroupcode(int surveyId, string groupcode)
        {

            if (await this._unitOfWork.Surveys.ExistsSurveyWithGroupcodeAsync(surveyId, groupcode))
            {
                return new ObjectResult(true);
            }
            else
            {
                return new ObjectResult(false);
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="pageNumber"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        [Route("viewer/{surveyId}/page/{pageNumber}")]
        [HttpGet]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> GetRespondentSurveyViewPageQuestions(int surveyId, int pageNumber,
            string language = "en")
        {
            var result =
                await this._viewService.GetSurveyViewPageQuestions(surveyId, SurveyViewType.RespondentView, pageNumber);
            if (result == null)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="pageNumber"></param>
        /// <param name="viewType"></param>
        /// <param name="language"></param>
        /// <returns></returns>
        [Route("{surveyId}/page/{pageNumber}/{viewType}/{language?}")]
        [HttpGet]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> GetSurveyViewPageQuestions(int surveyId, int pageNumber,
            SurveyViewType viewType, string language = "en")
        {
            var result = await this._viewService.GetSurveyViewPageQuestions(surveyId,
                viewType, pageNumber);
            if (result == null)
            {
                return new NotFoundResult();
            }

            return new ObjectResult(result.ToLocalizedModel<SurveyViewPageViewModel>(_mapper,"en"));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [Route("{surveyId:int}/terms/{viewType?}/{language?}")]
        [HttpGet]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> GetSurveyTermsAndConditions(int surveyId,
            SurveyViewType viewType = SurveyViewType.RespondentView, string language = "en")
        {
            var result = await this._viewService.GetSurveyTermsAndConditionsText(surveyId, "en", viewType);
            if (result == null)
            {
                return new NotFoundResult();
            }

            return new ObjectResult(result);
        }

        [Route("{surveyId:int}/screening/{language?}")]
        [HttpGet]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> GetSurveyScreeningQuestions(int surveyId, string language = null)
        {
            var result = await this._unitOfWork.SurveyViews.GetSurveyViewWithPagesStructureAsync(surveyId, "Standard");
            if (result == null)
            {
                return new NotFoundResult();
            }

            return new ObjectResult(result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [Route("{surveyId:int}/thankyou/{viewType?}/{language?}")]
        [HttpGet]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Produces(typeof(ObjectResult))]
        public async Task<IActionResult> GetSurveyThankYou(int surveyId,
            SurveyViewType viewType = SurveyViewType.RespondentView, string language = null)
        {
            var result = await this._viewService.GetSurveyThankYouText(surveyId, language, viewType);
            if (result == null)
            {
                return new NotFoundResult();
            }

            return new ObjectResult(result);
        }

        /// <summary>
        /// Sets the surey to complete for the current user (shortcode).
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="(Name"></param>
        /// <returns></returns>
        [Route("complete/{surveyId:int}")]
        [HttpPut]
        [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        public async Task<IActionResult> SurveyComplete(int surveyId, [FromHeader(Name = "Shortcode")] string shortcode)
        {

            var survey = await this._unitOfWork.Surveys.GetAsync(surveyId);
            if (survey != null)
            {
                var shortcodeObj = await this._unitOfWork.Shortcodes.GetShortcodeForSurveyAsync(survey, shortcode);
                shortcodeObj.SurveyCompleted = true;
                await this._unitOfWork.SaveChangesAsync();
                return new OkResult();

            }
            else
            {
                return new NotFoundResult();
            }

        }

    }
}