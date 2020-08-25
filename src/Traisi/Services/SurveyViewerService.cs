using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Traisi.Data;
using Traisi.Data.Core;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json.Linq;
using Traisi.Authorization.Enums;
using Traisi.Models.Surveys;
using Traisi.Helpers;
using Traisi.Services.Interfaces;
using Traisi.ViewModels;
using Traisi.ViewModels.Extensions;
using Traisi.ViewModels.SurveyViewer;
using Traisi.ViewModels.Users;
using Traisi.Models.ViewModels;
using Traisi.Models.Extensions;

namespace Traisi.Services
{
    public class SurveyViewerService : ISurveyViewerService
    {
        private IUnitOfWork _unitOfWork;
        private IAuthorizationService _authorizationService;
        private IAccountManager _accountManager;
        private ICodeGeneration _codeGeneration;
        private UserManager<TraisiUser> _userManager;
        private ISurveyRespondentService _respondentService;
        private IHttpContextAccessor _contextAccessor;
        private readonly IMapper _mapper;
        /// <summary>
        /// 
        /// </summary>
        /// <param name="unitOfWork"></param>
        /// <param name="authorizationService"></param>
        /// <param name="accountManager"></param>
        /// <param name="codeGenerationService"></param>
        /// <param name="userManager"></param>
        /// <param name="respondentService"></param>
        public SurveyViewerService(IUnitOfWork unitOfWork,
            IAuthorizationService authorizationService,
            IAccountManager accountManager,
            ICodeGeneration codeGenerationService,
            UserManager<TraisiUser> userManager,
            ISurveyRespondentService respondentService,
            IMapper mapper,
            IHttpContextAccessor contextAccessor)
        {
            this._unitOfWork = unitOfWork;
            this._accountManager = accountManager;
            this._authorizationService = authorizationService;
            this._codeGeneration = codeGenerationService;
            this._userManager = userManager;
            this._respondentService = respondentService;
            this._contextAccessor = contextAccessor;
            this._mapper = mapper;
        }

        /// <summary>
        /// Returns the Terms and Conditions text for the specified survey id of the chosen language
        /// </summary>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        public async Task<SurveyViewTermsAndConditionsViewModel> GetSurveyTermsAndConditionsText(int surveyId,
            string language = "en",
            SurveyViewType viewType = SurveyViewType.RespondentView)
        {
            Survey survey = await this._unitOfWork.Surveys.GetSurveyWelcomeView(surveyId, viewType, language);

            if (viewType == SurveyViewType.RespondentView && survey.SurveyViews.Count > 0)
            {
                var s2 = (survey.SurveyViews as List<SurveyView>);
                return (survey.SurveyViews as List<SurveyView>).Find(x => x.ViewName == "Standard")
                    .ToLocalizedModel<SurveyViewTermsAndConditionsViewModel>(_mapper, language);
            }
            else
            {
                return (survey.SurveyViews as List<SurveyView>).Find(x => x.ViewName == "Standard")
                    .ToLocalizedModel<SurveyViewTermsAndConditionsViewModel>(_mapper, language);
            }
        }

        /// <summary>
        /// Returns ths Thank You text for the specified survey id of the chosen language
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="language"></param>
        /// <param name="viewType"></param>
        /// <returns></returns>
        public async Task<SurveyViewThankYouViewModel> GetSurveyThankYouText(int surveyId, string language = "en",
         SurveyViewType viewType = SurveyViewType.RespondentView)
        {
            string viewName = viewType == SurveyViewType.RespondentView ? "Standard" : "CATI";
            Survey survey = await this._unitOfWork.Surveys.GetSurveyWithLabelsAsync(surveyId, viewType);
            // var surveyThankYou = survey.GetSurveyView(viewType).ThankYouPageLabels[language];
            return _mapper.Map<SurveyViewThankYouViewModel>(survey.GetSurveyView(viewType), opts =>
                 opts.Items["Language"] = language);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionId"></param>
        /// <returns></returns>
        public async Task<List<QuestionOption>> GetQuestionOptions(int questionId)
        {
            var questionOptions = await this._unitOfWork.QuestionOptions.GetQuestionOptionsFullAsync(questionId);
            return (List<QuestionOption>)questionOptions;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        private async Task<SurveyUser> GetSurveyUser(Survey survey, string shortcode)
        {
            return await this._accountManager.GetSurveyUserByShortcodeAsync(survey, shortcode);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="loginSuccess"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<bool> SurveyGroupcodeLogin(Survey survey,
            string code, ClaimsPrincipal user, string userAgent, JObject queryParams, IHttpContextAccessor accessor)
        {
            var groupcode = await this._unitOfWork.GroupCodes.GetGroupcodeForSurvey(survey, code);
            if (groupcode == null)
            {
                return false;
            }
            var parameters = new CodeGeneration()
            {
                CodeLength = 10,
                UsePattern = false
            };
            var shortcodeRes = await this._codeGeneration.GenerateShortCode(parameters, survey);
            shortcodeRes.Groupcode = groupcode;
            var createUserRes = await this.CreateSurveyUser(survey, shortcodeRes, user);
            var loginResult = await SurveyLogin(survey, shortcodeRes.Code, user);
            return loginResult;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="shortcode"></param>
        /// <param name="currentUser"></param>
        /// <returns></returns>
        private async Task<(bool succcess, string[], SurveyUser user, PrimaryRespondent respondent)>
            CreateSurveyUser(Survey survey, Shortcode shortcode, ClaimsPrincipal currentUser)
        {

            var user = new UserViewModel { UserName = Guid.NewGuid().ToString("D") };
            SurveyUser appUser = _mapper.Map<SurveyUser>(user);
            var result = await _accountManager.CreateSurveyUserAsync(appUser, shortcode, null,
                new (string claimName, string claimValue)[] {
                        ("SurveyId", survey.Id.ToString ()), ("Shortcode", shortcode.Code)
                });

            result.Item3.Shortcode = shortcode;

            // create the associated primary respondent 
            var respondent = await this._respondentService.CreatePrimaryRespondentForUser(appUser, survey);
            result.Item3.PrimaryRespondent = respondent;
            return (result.Item1, result.Item2, result.Item3, respondent);

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="accessor"></param>
        /// <returns></returns>
        public async Task<SurveyAccessParameters> GetSurveyAccessParameters(IHttpContextAccessor accessor)
        {
            // read the body
            string queryParams = default;
            using (StreamReader reader = new StreamReader(accessor.HttpContext.Request.Body, Encoding.UTF8))
            {
                queryParams = await reader.ReadToEndAsync();
            }
            return new SurveyAccessParameters()
            {
                QueryParams = queryParams,
                RemoteIpAddress = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                RequestUrl = accessor.HttpContext.Request.Host.Value + accessor.HttpContext.Request.Path.Value,
                UserAgent = accessor.HttpContext.Request.Headers["User-Agent"]

            };
        }

        /// <inheritdoc />
        /// <summary>
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        public async Task<bool> SurveyLogin(Survey survey, string shortcode, ClaimsPrincipal currentUser)
        {
            var accessParameters = await GetSurveyAccessParameters(_contextAccessor);
            var primaryRespondent = await GetPrimaryRespondent(survey, shortcode, currentUser);
            if (primaryRespondent == null)
            {
                // no primary respondent exists
                return false;
            }
            else
            {
                // add a new survey access record for the primary respondent
                primaryRespondent.SurveyAccessRecords.Add(CreateSurveyAccessRecord(primaryRespondent, accessParameters));
            }
            await this._unitOfWork.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="shortcode"></param>
        /// <param name="currentUser"></param>
        /// <returns></returns>
        private async Task<PrimaryRespondent> GetPrimaryRespondent(Survey survey, string shortcode, ClaimsPrincipal currentUser)
        {
            PrimaryRespondent primaryRespondent = null;
            if (currentUser.Identity.IsAuthenticated)
            {
                if (currentUser.IsInRole(TraisiRoles.SuperAdministrator))
                {
                    var user = await _userManager.FindByNameAsync(currentUser.Identity.Name);
                    primaryRespondent = await _unitOfWork.SurveyRespondents.GetPrimaryRespondentForSurveyAndTraisiUserAsync(user, survey);

                    if (primaryRespondent == null)
                    {
                        primaryRespondent = await _respondentService.CreatePrimaryRespondentForUser(user, survey);
                    }
                }
            }
            else
            {
                var existingUser = await this.GetSurveyUser(survey, shortcode);
                if (existingUser == null)
                {
                    var shortcodeRef = await this._unitOfWork.Shortcodes.GetShortcodeForSurveyAsync(survey, shortcode);
                    if (shortcodeRef == null)
                    {
                        return null;
                    }
                    var res = await CreateSurveyUser(survey, shortcodeRef, currentUser);
                    primaryRespondent = res.respondent;
                }
                else
                {
                    primaryRespondent = existingUser.PrimaryRespondent;
                }
            }
            return primaryRespondent;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="respondent"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        private SurveyAccessRecord CreateSurveyAccessRecord(PrimaryRespondent respondent, SurveyAccessParameters parameters)
        {
            var record = new SurveyAccessRecord()
            {
                AccessDateTime = DateTime.Now,
                UserAgent = parameters.UserAgent,
                RemoteIpAddress = parameters.RemoteIpAddress,
                QueryParams = parameters.QueryParams,
                AccessUser = respondent.User,
                RequestUrl = parameters.RequestUrl
            };
            record.Respondent = respondent;
            return record;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        public async Task<SurveyView> GetDefaultSurveyView(int surveyId)
        {
            var survey = await this._unitOfWork.Surveys.GetSurveyWithLabelsAsync(surveyId, SurveyViewType.RespondentView);

            return (survey.SurveyViews as List<SurveyView>).Find(x => x.ViewName == "Standard");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <returns></returns>
        public SurveyView GetDefaultSurveyView(Survey survey)
        {
            return survey.SurveyViews.GetEnumerator().Current;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>
        public async Task<Survey> GetSurveyFromCode(string code)
        {
            return await this._unitOfWork.Surveys.GetSurveyByCodeAsync(code);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public async Task<SurveyStartViewModel> GetSurveyWelcomeView(string name)
        {
            Survey survey = await this._unitOfWork.Surveys.GetSurveyWelcomeView(name, SurveyViewType.RespondentView, "en");
            return survey.ToLocalizedModel<SurveyStartViewModel>(_mapper, "en");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        public bool AuthorizeSurveyUser(Survey survey, string shortcode)
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="viewType"></param>
        /// <param name="pageNumber"></param>
        /// <returns></returns>
        public async Task<QuestionPartView> GetSurveyViewPageQuestions(int surveyId, SurveyViewType viewType,
            int pageNumber)
        {
            var survey = await this._unitOfWork.Surveys.GetSurveyFullAsync(surveyId, viewType);
            if (survey != null)
            {
                return ((List<SurveyView>)survey.SurveyViews).Find(x =>
                {
                    if (viewType == SurveyViewType.RespondentView)
                    {
                        return x.ViewName == "Standard";
                    }
                    else
                    {
                        return x.ViewName != "Standard";
                    }
                }).QuestionPartViews
                    .FirstOrDefault(v => v.Order == pageNumber);
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyId"></param>
        /// /// <param name="viewType"></param>
        /// <param name="pageNumber"></param>
        /// <returns></returns>
        public async Task<List<QuestionPartView>> GetSurveyViewPages(int surveyId, SurveyViewType viewType)
        {
            var survey = await this._unitOfWork.Surveys.GetSurveyFullAsync(surveyId, viewType);
            if (survey != null)
            {
                List<QuestionPartView> pages = survey.SurveyViews.Find(x =>
                {
                    if (viewType == SurveyViewType.RespondentView)
                    {
                        return x.ViewName == "Standard";
                    }
                    else
                    {
                        return x.ViewName != "Standard";
                    }
                }).QuestionPartViews.OrderBy(p => p.Order).ToList();
                pages.ForEach(page =>
                {
                    page.QuestionPartViewChildren = page.QuestionPartViewChildren.OrderBy(mq => mq.Order).ToList();
                    ((List<QuestionPartView>)page.QuestionPartViewChildren).ForEach(child =>
                    {
                        if (child.QuestionPartViewChildren != null && child.QuestionPartViewChildren.Count > 1)
                        {
                            child.QuestionPartViewChildren = child.QuestionPartViewChildren.OrderBy(mq => mq.Order).ToList();
                        }
                    });
                });
                return pages;
            }
            else
            {
                return null;
            }
        }
    }
}