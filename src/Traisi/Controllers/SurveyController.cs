using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Traisi.Data;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models.Surveys;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Traisi.Helpers;
using Traisi.ViewModels;
using Traisi.Data.Models.Questions;

namespace Traisi.Controllers
{
    [Authorize(Authorization.Policies.AccessAdminPolicy)]
    [Route("api/[controller]")]
    public class SurveyController : Controller
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthorizationService _authorizationService;
        private readonly IAccountManager _accountManager;
        private readonly IFileDownloader _fileDownloader;

        private readonly IMapper _mapper;

        public SurveyController(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment,
        IFileDownloader fileDownloaderService, IAuthorizationService authorizationService,
         IAccountManager accountManager,
         IMapper mapper)
        {
            this._unitOfWork = unitOfWork;
            this._authorizationService = authorizationService;
            this._accountManager = accountManager;
            this._fileDownloader = fileDownloaderService;
            this._mapper = mapper;
        }

        /// <summary>
        /// Get survey by ID
        /// </summary>
        [HttpGet("{id}")]
        [Produces(typeof(SurveyViewModel))]
        public async Task<IActionResult> GetSurvey(int id)
        {
            var survey = await this._unitOfWork.Surveys.GetSurveyWithPermissionsAsync(id);
            if (survey.Owner == this.User.Identity.Name || await IsSuperAdmin() || await IsGroupAdmin(survey.Group))
            {
                return Ok(_mapper.Map<SurveyViewModel>(survey));
            }
            else
            {
                var surveyPermissions = await this._unitOfWork.Surveys.GetSurveyWithUserPermissionsAsync(id, this.User.Identity.Name);
                if (surveyPermissions.SurveyPermissions.Any())
                {
                    return Ok(_mapper.Map<SurveyViewModel>(surveyPermissions));
                }
                else
                {
                    return BadRequest("User does not have permissions to access survey.");
                }
            }
        }

        /// <summary>
        /// Get all surveys owned by the calling user
        /// </summary>
        [HttpGet]
        [Produces(typeof(List<SurveyViewModel>))]
        public async Task<IActionResult> GetSurveys()
        {
            var surveys = await this._unitOfWork.Surveys.GetAllUserSurveysAsync(this.User.Identity.Name);
            return Ok(_mapper.Map<IEnumerable<SurveyViewModel>>(surveys));
        }

        /// <summary>
        /// Get all surveys for the specified group where user is not owner and has no permissions.
        /// </summary>
        [HttpGet("group/{id}")]
        [Produces(typeof(List<SurveyViewModel>))]
        public async Task<IActionResult> GetGroupSurveysWithNoPermissions(int id)
        {
            var group = this._unitOfWork.UserGroups.Get(id);
            if (group == null)
            {
                return BadRequest("Group does not exist.");
            }
            else
            {
                //Check if user is in the group or superadmin
                if (await IsSuperAdmin() || await MemberOfGroup(id))
                {
                    var surveys = await this._unitOfWork.Surveys.GetAllGroupSurveysAsync(group.Name, this.User.Identity.Name);
                    return Ok(_mapper.Map<IEnumerable<SurveyViewModel>>(surveys));
                }
                else
                {
                    return BadRequest("User does not have access to group.");
                }
            }
        }

        /// <summary>
        /// Get all surveys shared with user
        /// </summary>
        /// <returns></returns>
        [HttpGet("shared")]
        [Produces(typeof(List<SurveyViewModel>))]
        public async Task<IActionResult> GetSharedSurveys()
        {
            var surveys = await this._unitOfWork.Surveys.GetSharedSurveysAsync(this.User.Identity.Name);
            return Ok(_mapper.Map<IEnumerable<SurveyViewModel>>(surveys));
        }

        /// <summary>
        /// Create survey
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateSurvey([FromBody] SurveyViewModel survey)
        {
            if (ModelState.IsValid)
            {
                if (survey == null)
                {
                    return BadRequest($"{nameof(survey)} cannot be null");
                }
                else
                {
                    // ensure survey code is unique
                    var existingSurveyWithCode = await this._unitOfWork.Surveys.GetSurveyByCodeAsync(survey.Code);
                    if (existingSurveyWithCode != null)
                    {
                        return BadRequest("Survey code already in use.");
                    }
                    // Check if survey has a valid group
                    Survey appSurvey = _mapper.Map<Survey>(survey);
                    var group = await this._unitOfWork.UserGroups.GetGroupByNameAsync(appSurvey.Group);

                    if (group == null)
                    {
                        return BadRequest("Group does not exist.");
                    }
                    else
                    {
                        if (await IsSuperAdmin() || await this.MemberOfGroup(group.Id))
                        {
                            appSurvey.Owner = this.User.Identity.Name;
                            appSurvey.PopulateDefaults();
                            await this._unitOfWork.Surveys.AddAsync(appSurvey);
                            await this._unitOfWork.SaveChangesAsync();
                            return new OkResult();
                        }
                        else
                        {
                            return BadRequest("User must be a member of the group to create the survey.");
                        }

                    }
                }
            }
            return BadRequest(ModelState);
        }

        /// <summary>
        /// Update a survey
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateSurvey([FromBody] SurveyViewModel survey)
        {
            //check group of input survey and ensure that user has access before updating survey
            if (ModelState.IsValid)
            {
                Survey appSurvey = _mapper.Map<Survey>(survey);
                Survey originalSurvey = this._unitOfWork.Surveys.Get(appSurvey.Id);

                if (await IsSuperAdmin() || originalSurvey.Owner == this.User.Identity.Name || await IsGroupAdmin(appSurvey.Group))
                {
                    // ensure survey code is unique
                    if (originalSurvey.Code != appSurvey.Code)
                    {
                        var existingSurveyWithCode = await this._unitOfWork.Surveys.GetSurveyByCodeAsync(survey.Code);
                        if (existingSurveyWithCode != null && existingSurveyWithCode.Id != survey.Id)
                        {
                            return BadRequest("Survey code already in use.");
                        }
                    }
                    originalSurvey.Code = appSurvey.Code;
                    originalSurvey.DefaultLanguage = appSurvey.DefaultLanguage;
                    originalSurvey.EndAt = appSurvey.EndAt;
                    originalSurvey.IsActive = appSurvey.IsActive;
                    originalSurvey.IsOpen = appSurvey.IsOpen;
                    originalSurvey.Name = appSurvey.Name;
                    originalSurvey.RejectionLink = appSurvey.RejectionLink;
                    originalSurvey.StartAt = appSurvey.StartAt;
                    originalSurvey.StyleTemplate = appSurvey.StyleTemplate;
                    originalSurvey.SuccessLink = appSurvey.SuccessLink;

                    await this._unitOfWork.SaveChangesAsync();
                    return new OkResult();
                }
                else
                {
                    if (originalSurvey.Code != appSurvey.Code)
                    {
                        return BadRequest("Insufficient priveleges to change survey code");
                    }
                    else
                    {
                        var surveyPermissions = await this._unitOfWork.SurveyPermissions.GetPermissionsForSurveyAsync(this.User.Identity.Name, appSurvey.Id);
                        if (surveyPermissions.Permissions.Contains("survey.modify"))
                        {

                            appSurvey.Owner = originalSurvey.Owner;
                            appSurvey.Group = originalSurvey.Group;
                            appSurvey.SurveyPermissions = originalSurvey.SurveyPermissions;
                            appSurvey.SurveyViews = originalSurvey.SurveyViews;
                            this._unitOfWork.Surveys.Update(appSurvey);
                            await this._unitOfWork.SaveChangesAsync();
                            return new OkResult();
                        }
                        else
                        {
                            return BadRequest("Insufficient privileges.");
                        }
                    }
                }
            }
            return BadRequest(ModelState);
        }

        /// <summary>
        /// Delete a survey
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSurvey(int id)
        {
            // restrict to owner, group admin, and users with delete permissions
            var survey = await this._unitOfWork.Surveys.GetSurveyWithPermissionsAsync(id);
            var removed = this._unitOfWork.Surveys.Get(id);
            if (survey.Owner == this.User.Identity.Name || await IsGroupAdmin(survey.Group))
            {
                List<int> qParts = this._unitOfWork.QuestionParts.ClearQuestionPartSurveyField(id);
                this._unitOfWork.Surveys.Remove(removed);
                await this._unitOfWork.SaveChangesAsync();
                this._unitOfWork.QuestionParts.ClearQuestionParts(qParts);
                await this._unitOfWork.SaveChangesAsync();
                return new OkResult();
            }
            else
            {
                var surveyPermissions = await this._unitOfWork.SurveyPermissions.GetPermissionsForSurveyAsync(this.User.Identity.Name, survey.Id);
                if (surveyPermissions.Permissions != null && surveyPermissions.Permissions.Contains("survey.delete"))
                {
                    this._unitOfWork.Surveys.Remove(removed);
                    await this._unitOfWork.SaveChangesAsync();
                    return new OkResult();
                }
                else
                {
                    return BadRequest("Insufficient privileges.");
                }

            }
        }

        [AllowAnonymous]
        [HttpGet("{id}/export")]
        public async Task<IActionResult> ExportSurvey(int id)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            string code = this._fileDownloader.GenerateFileCode();
            string fileName = await this._fileDownloader.ExportSurvey(code, this.User.Identity.Name, survey);
            var stream = new FileStream(fileName, FileMode.Open);
            return File(stream, "application/octet-stream", $"{survey.Code}.zip");

        }

        [HttpPost("import"), DisableRequestSizeLimit]
        public async Task<IActionResult> ImportSurvey()
        {
            try
            {
                var file = Request.Form.Files[0];
                if (Request.Headers.ContainsKey("parameters"))
                {
                    SurveyViewModel surveyParameters = JsonConvert.DeserializeObject<SurveyViewModel>(Request.Headers["parameters"]);
                    SurveyViewModelValidator parameterValidator = new SurveyViewModelValidator();
                    ValidationResult validParameters = parameterValidator.Validate(surveyParameters);
                    if (validParameters.IsValid)
                    {
                        var existingSurveyWithCode = await this._unitOfWork.Surveys.GetSurveyByCodeAsync(surveyParameters.Code);
                        if (existingSurveyWithCode != null)
                        {
                            return BadRequest("Survey code already in use.");
                        }

                        var group = await this._unitOfWork.UserGroups.GetGroupByNameAsync(surveyParameters.Group);

                        if (group == null)
                        {
                            return BadRequest("Group does not exist.");
                        }
                        else
                        {
                            if (await IsSuperAdmin() || await this.MemberOfGroup(group.Id))
                            {
                                Survey imported = await this._fileDownloader.ExtractSurveyImportAsync(file, this.User.Identity.Name);
                                imported.Owner = this.User.Identity.Name;
                                imported.Name = surveyParameters.Name;
                                imported.Code = surveyParameters.Code;
                                imported.Group = surveyParameters.Group;
                                imported.RejectionLink = surveyParameters.RejectionLink;
                                imported.SuccessLink = surveyParameters.SuccessLink;
                                imported.StartAt = surveyParameters.StartAt;
                                imported.EndAt = surveyParameters.EndAt;
                                imported.IsActive = surveyParameters.IsActive;
                                imported.IsOpen = surveyParameters.IsOpen;
                                this._unitOfWork.Surveys.Add(imported);
                                await this._unitOfWork.SaveChangesAsync();
                                return new OkResult();
                            }
                            else
                            {
                                return BadRequest("User must be a member of the group to create the survey.");
                            }

                        }

                    }
                    else
                    {
                        AddErrors(validParameters.Errors.Select(e => e.ErrorMessage));
                        return BadRequest(ModelState);
                    }
                }
                else
                {
                    return BadRequest("Missing Code Generation Parameters");
                }
            }
            catch (System.Exception ex)
            {
                return BadRequest("Import Failed: " + ex.Message);
            }
        }

        /// <summary>
        /// Get user permissions for given survey
        /// </summary>
        /// <param name="id"></param>
        /// <param name="userName"></param>
        /// <returns></returns>
        [HttpGet("{id}/permissions/{userName}")]
        [Produces(typeof(List<SurveyPermissionViewModel>))]
        public async Task<IActionResult> GetUserSurveyPermissions(int id, string userName)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            var surveyPermissions = await this._unitOfWork.SurveyPermissions.GetPermissionsForSurveyAsync(userName, id);
            //Restrict to super admins, group admins, owners, and users with survey.share permissions
            if (survey.Owner == this.User.Identity.Name || await IsSuperAdmin() || await IsGroupAdmin(survey.Group))
            {
                return Ok(_mapper.Map<SurveyPermissionViewModel>(surveyPermissions));
            }
            else
            {
                if (surveyPermissions.Permissions.Contains("survey.share"))
                {
                    return Ok(_mapper.Map<SurveyPermissionViewModel>(surveyPermissions));
                }
                else
                {
                    return BadRequest("Insufficient privileges.");
                }
            }
        }

        /// <summary>
        /// Update user permissions for given survey
        /// </summary>
        /// <param name="userName"></param>
        /// <returns></returns>
        [HttpPut("permissions")]
        public async Task<IActionResult> UpdateUserSurveyPermissions([FromBody] SurveyPermissionViewModel surveyPermissions)
        {
            if (ModelState.IsValid)
            {
                var survey = await this._unitOfWork.Surveys.GetAsync(surveyPermissions.SurveyId);
                var surveyPermissionsModel = _mapper.Map<SurveyPermission>(surveyPermissions);
                // Restrict to group admins, owners, and users with survey.share permissions.
                if (survey.Owner == this.User.Identity.Name || await IsGroupAdmin(survey.Group))
                {
                    this._unitOfWork.SurveyPermissions.Update(surveyPermissionsModel);
                    await this._unitOfWork.SaveChangesAsync();
                    return new OkResult();
                }
                else
                {
                    var userPermissions = await this._unitOfWork.SurveyPermissions.GetPermissionsForSurveyAsync(this.User.Identity.Name, surveyPermissions.SurveyId);
                    if (surveyPermissions.Permissions.Contains("survey.share"))
                    {
                        this._unitOfWork.SurveyPermissions.Update(surveyPermissionsModel);
                        await this._unitOfWork.SaveChangesAsync();
                        return new OkResult();
                    }
                    else
                    {
                        return BadRequest("Insufficient privileges.");
                    }
                }
            }
            return BadRequest(ModelState);
        }

        /// <summary>
        /// Check if group admin has given permission
        /// </summary>
        /// <param name="permission"></param>
        /// <returns></returns>
        private async Task<bool> CheckGroupAdminPermission(string permission)
        {
            var role = await _accountManager.GetRoleLoadRelatedAsync("group administrator");
            var hasPermission = (from r in role.Claims where r.ClaimValue == permission select r).Any();
            return hasPermission;
        }

        /// <summary>
        /// Check if user is super admin
        /// </summary>
        /// <param name="User"></param>
        /// <returns></returns>
        private async Task<bool> IsSuperAdmin()
        {
            var isSuperAdmin = (await _authorizationService.AuthorizeAsync(this.User, Authorization.Policies.ManageAllGroupsPolicy)).Succeeded;
            return isSuperAdmin;
        }

        /// <summary>
        /// Check if user is group admin and has permissions to manage group surveys
        /// </summary>
        /// <param name="id"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        private async Task<bool> IsGroupAdmin(string groupName)
        {
            bool groupAdminHasPermission = await this.CheckGroupAdminPermission("surveys.managegroup");
            var isGroupAdmin = groupAdminHasPermission && await this._unitOfWork.GroupMembers.IsGroupAdminAsync(this.User.Identity.Name, groupName);
            return isGroupAdmin;
        }

        /// <summary>
        /// Check if user is a member of given group
        /// </summary>
        /// <param name="groupId"></param>
        /// <returns></returns>
        private async Task<bool> MemberOfGroup(int groupId)
        {
            var groupMembers = await this._unitOfWork.UserGroups.GetGroupMembersInfoAsync(groupId);
            bool memberOfGroup = groupMembers.Where(m => m.Item1.UserName == this.User.Identity.Name).Any();
            return memberOfGroup;
        }

        private void AddErrors(IEnumerable<string> errors)
        {
            foreach (var error in errors)
            {
                ModelState.AddModelError(string.Empty, error);
            }
        }
    }
}