using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data;
using Traisi.Data.Models;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Traisi.Sdk.Enums;
using System.Collections;
using Microsoft.AspNetCore.Http;
using Traisi.Authorization;
using Traisi.Services.Interfaces;
using Traisi.ViewModels.SurveyViewer;
using AutoMapper;

namespace Traisi.Controllers.SurveyViewer
{
    /// <summary>
    /// 
    /// </summary>
    [Authorize]
    // [Authorize(Policy = Policies.RespondToSurveyPolicy)]
    [ApiController]
    [Route("api/[controller]/")]
    public class SurveyRespondentController : ControllerBase
    {
        private ISurveyResponseService _respondentService;

        private IRespondentGroupService _respondentGroupService;

        private UserManager<ApplicationUser> _userManager;


        private IUnitOfWork _unitOfWork;

        private readonly IMapper _mapper;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="respondentService"></param>
        /// <param name="respondentGroupService"></param>
        /// <param name="unitOfWork"></param>
        /// <param name="userManager"></param>
        public SurveyRespondentController(ISurveyResponseService respondentService,
            IRespondentGroupService respondentGroupService,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager)
        {
            this._respondentService = respondentService;
            this._userManager = userManager;
            this._respondentGroupService = respondentGroupService;
            this._unitOfWork = unitOfWork;
            this._mapper = mapper;
        }



        [Produces(typeof(SurveyRespondentViewModel))]
        //[Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [HttpGet]
        [Route("surveys/{surveyId}/respondents/primary", Name = "Get_Primary_Respondent_For_Survey")]
        public async Task<ActionResult<PrimaryRespondent>> GetSurveyPrimaryRespondent(int surveyId)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(surveyId);
            if (survey == null)
            {
                return new NotFoundResult();
            }
            else
            {
                var user = await _userManager.FindByNameAsync(this.User.Identity.Name);
                var respondent = await this._unitOfWork.SurveyRespondents.GetPrimaryRespondentForSurveyAndTraisiUserAsync(user, survey);

                if (respondent == null)
                {

                    var newRespondent = await this._unitOfWork.SurveyRespondents.CreatePrimaryResponentForUserAsnyc(user);
                    newRespondent.SurveyAccessDateTime = DateTime.Now;
                    newRespondent.Survey = survey;
                    this._unitOfWork.SaveChanges();
                    var resp = _mapper.Map<SurveyRespondentViewModel>(newRespondent);
                    return new OkObjectResult(resp);

                }
                else
                {
                    var resp = _mapper.Map<SurveyRespondentViewModel>(respondent);
                    return new OkObjectResult(resp);
                }
            }
        }

        /// <summary>
        /// Adds passed respondent to a survey group.
        /// </summary>
        /// <param name="respondent"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
        //[Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Route("respondents/groups")]
        public async Task<IActionResult> AddSurveyGroupMember([FromBody] SurveyRespondentViewModel respondent)
        {
            var user = await _userManager.FindByNameAsync(this.User.Identity.Name);
            var model = _mapper.Map<SubRespondent>(respondent);
            var group = await this._respondentGroupService.GetSurveyRespondentGroupForUser(user);
            await this._respondentGroupService.AddRespondent(group, model);
            // await this._unitOfWork.SaveChangesAsync();
            return new CreatedResult("", model.Id);
        }

        /// <summary>
        /// Updates a respondent details from a particular group
        /// </summary>
        /// <param name="respondent"></param>
        /// <returns></returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        // [Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Route("respondents/groups")]
        public async Task<IActionResult> UpdateSurveyGroupMember([FromBody] SurveyRespondentViewModel respondent)
        {

            var user = await _userManager.FindByNameAsync(this.User.Identity.Name);
            //var model = _mapper.Map<SubRespondent>(respondent);
            //var group = await this._respondentGroupService.GetSurveyRespondentGroupForUser(user);
            var result = await this._respondentGroupService.UpdateRespondent(respondent, user);
            await this._unitOfWork.SaveChangesAsync();
            return new OkResult();
        }

        /// <summary>
        /// Removes the associated respondent from their belonging survey group.
        /// </summary>
        /// <param name="respondentId"></param>
        /// <returns></returns>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        //[Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Route("groups/respondents/{respondentId}")]
        public async Task<IActionResult> RemoveSurveyGroupMember(
            int respondentId)
        {

            var respondent = await this._unitOfWork.SurveyRespondents.GetAsync(respondentId);
            if (respondent == null)
            {
                return new BadRequestResult();
            }

            var user = await _userManager.FindByNameAsync(this.User.Identity.Name);
            var group = await this._respondentGroupService.GetSurveyRespondentGroupForUser(user);
            await this._respondentGroupService.RemoveRespondent(group, respondent);
            await this._unitOfWork.SaveChangesAsync();
            return new OkResult();
        }

        /// <summary>
        /// Lists survey respondents (including primary) that are part of the passed respondent's group.
        /// </summary>
        /// <param name="AuthorizationFields.RESPONDENT"></param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<SurveyRespondentViewModel>), StatusCodes.Status200OK)]
        //[Authorize(Policy = Policies.RespondToSurveyPolicy)]
        [Route("groups/respondents/{respondentId}")]
        public async Task<IActionResult> ListSurveyGroupMembers(int respondentId)
        {
            var user = await _userManager.FindByNameAsync(this.User.Identity.Name);
            var group = await this._respondentGroupService.GetSurveyRespondentGroupForUser(user);
            var members = _mapper.Map<List<SurveyRespondentViewModel>>(group.GroupMembers);
            return new OkObjectResult(members);
        }
    }
}