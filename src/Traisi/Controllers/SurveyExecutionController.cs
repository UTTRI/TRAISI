using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using Traisi.Data;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models.Surveys;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Traisi.Helpers;
using Traisi.ViewModels;

namespace Traisi.Controllers
{
    [Authorize(Authorization.Policies.AccessAdminPolicy)]
    [Route("api/[controller]")]
    public class SurveyExecutionController : Controller
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthorizationService _authorizationService;
        private readonly IAccountManager _accountManager;
        private readonly ICodeGeneration _codeGeneration;
        private readonly IFileDownloader _fileDownloader;

        private readonly IMapper _mapper;

        public SurveyExecutionController(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment,
            IAuthorizationService authorizationService, IAccountManager accountManager,
            ICodeGeneration codeGenerationService, IFileDownloader fileDownloaderService,
            IMapper mapper)
        {
            this._unitOfWork = unitOfWork;
            this._authorizationService = authorizationService;
            this._accountManager = accountManager;
            this._codeGeneration = codeGenerationService;
            this._fileDownloader = fileDownloaderService;
            this._mapper = mapper;
        }

        /// <summary>
        /// Get all shortcodes for survey
        /// </summary>
        /// <param name="id"></param>
        /// <param name="mode"></param>
        /// <returns></returns>
        [HttpGet("{id}/{mode}")]
        [Produces(typeof(List<ShortcodeViewModel>))]
        public async Task<IActionResult> GetSurveyShortcodes(int id, string mode)
        {
            return await this.GetSurveyShortcodes(id, mode, -1, -1);
        }

        /// <summary>
        /// Gets shortcodes for survey (with page passed in)
        /// </summary>
        /// <param name="id"></param>
        /// <param name="mode"></param>
        /// <param name="pageIndex"></param>
        /// <param name="pageSize"></param>
        /// <returns></returns>
        [HttpGet("{id}/{mode}/{pageIndex}/{pageSize}")]
        [Produces(typeof(List<ShortcodeViewModel>))]
        public async Task<IActionResult> GetSurveyShortcodes(int id, string mode, int pageIndex, int pageSize)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(id))
            {
                var shortcodes = await this._unitOfWork.Shortcodes.GetShortcodesForSurveyAsync(id, mode == "test", pageIndex, pageSize);
                return Ok(_mapper.Map<IEnumerable<ShortcodeViewModel>>(shortcodes));
            }
            else
            {
                return BadRequest("User does not have permissions to execute this survey.");
            }
        }

        /// <summary>
        /// Download all shortcodes for survey
        /// </summary>
        /// <param name="id"></param>
        /// <param name="mode"></param>
        /// <returns></returns>
        [HttpGet("{id}/{mode}/download")]
        [Produces(typeof(string))]
        public async Task<IActionResult> DownloadSurveyShortcodes(int id, string mode)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(id))
            {
                string code = this._fileDownloader.GenerateFileCode();
                this._fileDownloader.WriteShortcodeFile(code, this.User.Identity.Name, mode, survey);
                return Ok(code);
            }
            else
            {
                return BadRequest("User does not have permissions to execute this survey.");
            }
        }

        /// <summary>
        /// Download all group codes for survey
        /// </summary>
        /// <param name="id"></param>
        /// <param name="mode"></param>
        /// <returns></returns>
        [HttpGet("{id}/groupcode/{mode}/download")]
        [Produces(typeof(string))]
        public async Task<IActionResult> DownloadSurveyGroupCodes(int id, string mode)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(id))
            {
                string code = this._fileDownloader.GenerateFileCode();
                this._fileDownloader.WriteGroupCodeFile(code, this.User.Identity.Name, mode, survey);
                return Ok(code);
            }
            else
            {
                return BadRequest("User does not have permissions to execute this survey.");
            }

        }

        [HttpGet("{id}/{mode}/count")]
        [Produces(typeof(int))]
        public async Task<IActionResult> GetNumberSurveyShortCodes(int id, string mode)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(id))
            {
                var numCodes = await this._unitOfWork.Shortcodes.GetCountOfShortcodesForSurveyAsync(id, mode == "test");
                return Ok(numCodes);
            }
            else
            {
                return BadRequest("User does not have permissions to execute this survey.");
            }
        }

        /// <summary>
        /// Get all group codes for survey
        /// </summary>
        /// <param name="id"></param>
        /// <param name="mode"></param>
        /// <returns></returns>
        [HttpGet("{id}/groupcode/{mode}")]
        [Produces(typeof(List<GroupCodeViewModel>))]
        public async Task<IActionResult> GetSurveyGroupCodes(int id, string mode)
        {
            return await this.GetSurveyGroupCodes(id, mode, -1, -1);
        }

        [HttpGet("{id}/groupcode/{mode}/{pageIndex}/{pageSize}")]
        [Produces(typeof(List<GroupCodeViewModel>))]
        public async Task<IActionResult> GetSurveyGroupCodes(int id, string mode, int pageIndex, int pageSize)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(id))
            {
                var groupcodes = await this._unitOfWork.GroupCodes.GetGroupCodesForSurveyAsync(id, mode == "test", pageIndex, pageSize);
                return Ok(_mapper.Map<IEnumerable<GroupCodeViewModel>>(groupcodes));
            }
            else
            {
                return BadRequest("User does not have permissions to execute this survey.");
            }
        }

        [HttpGet("{id}/groupcode/{mode}/count")]
        [Produces(typeof(int))]
        public async Task<IActionResult> GetNumberSurveyGroupCodes(int id, string mode)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(id);
            if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(id))
            {
                var numCodes = await this._unitOfWork.GroupCodes.GetCountOfGroupCodesForSurveyAsync(id, mode == "test");
                return Ok(numCodes);
            }
            else
            {
                return BadRequest("User does not have permissions to execute this survey.");
            }
        }

        /// <summary>
        /// Generate short codes for survey
        /// </summary>
        /// <param name="codeParameters"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateShortcodes([FromBody] CodeGenerationViewModel codeParameters)
        {
            if (ModelState.IsValid)
            {
                Survey survey = await this._unitOfWork.Surveys.GetAsync(codeParameters.SurveyId);
                //Survey survey = codeParameters.NumberOfCodes > 1? await this._unitOfWork.Surveys.GetSurveyWithAllCodesAsync(codeParameters.SurveyId) : await this._unitOfWork.Surveys.GetAsync(codeParameters.SurveyId);
                CodeGeneration codeGenerationParameters = _mapper.Map<CodeGeneration>(codeParameters);
                if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(codeParameters.SurveyId))
                {
                    if (codeGenerationParameters.NumberOfCodes > 1)
                    {
                        this._codeGeneration.GenerateShortCodesBatch(codeGenerationParameters, survey);
                    }
                    else
                    {
                        await this._codeGeneration.GenerateShortCode(codeGenerationParameters, survey);
                    }
                    await this._unitOfWork.SaveChangesAsync();
                    return new OkResult();
                }
                return BadRequest("User does not have permissions to execute this survey.");
            }
            return BadRequest(ModelState);
        }

        [HttpPost("uploadIndividual"), DisableRequestSizeLimit]
        public async Task<IActionResult> ImportIndividualCodes()
        {
            try
            {
                var file = Request.Form.Files[0];
                if (Request.Form.ContainsKey("parameters"))
                {
                    CodeGenerationViewModel codeParameters = JsonConvert.DeserializeObject<CodeGenerationViewModel>(Request.Form["parameters"]);
                    codeParameters.NumberOfCodes = 1; //hack to prevent error
                    CodeGenerationViewModelValidator parameterValidator = new CodeGenerationViewModelValidator();
                    ValidationResult validParameters = parameterValidator.Validate(codeParameters);
                    if (validParameters.IsValid)
                    {
                        int numberofCodes = 0;
                        string line;
                        using (StreamReader fileStream = new StreamReader(file.OpenReadStream()))
                        {
                            //for now assume valid line, generate a code per line (change later)
                            while ((line = fileStream.ReadLine()) != null)
                            {
                                numberofCodes++;
                            }
                        }
                        codeParameters.NumberOfCodes = numberofCodes;
                        return await this.CreateShortcodes(codeParameters);
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
                return BadRequest("Upload Failed: " + ex.Message);
            }
        }

        /// <summary>
        /// Generate group code for survey
        /// </summary>
        /// <param name="codeParameters"></param>
        /// <returns></returns>
        [HttpPost("groupcode")]
        public async Task<IActionResult> CreateGroupCode([FromBody] CodeGenerationViewModel codeParameters)
        {
            if (ModelState.IsValid)
            {
                var survey = await this._unitOfWork.Surveys.GetAsync(codeParameters.SurveyId);

                if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(codeParameters.SurveyId))
                {
                    CodeGeneration codeGenerationParameters = _mapper.Map<CodeGeneration>(codeParameters);
                    this._codeGeneration.GenerateGroupCode(codeGenerationParameters, survey);
                    await this._unitOfWork.SaveChangesAsync();
                    return new OkResult();
                }
                return BadRequest("User does not have permissions to execute this survey.");
            }
            return BadRequest(ModelState);
        }

        [HttpDelete("individual-codes/{surveyId}")]
        public async Task<IActionResult> DeleteAllInvidiualCodesForSurvey(int surveyId)
        {
            var survey = await this._unitOfWork.Surveys.GetAsync(surveyId);
            if (survey == null)
            {
                return new NotFoundResult();
            }
            await this._unitOfWork.Shortcodes.RemoveAllInvividualCodesForSurveyAsync(survey);

            return new OkResult();

        }

        [HttpPost("uploadGroup"), DisableRequestSizeLimit]
        public async Task<IActionResult> ImportGroupCodes()
        {
            try
            {
                var file = Request.Form.Files[0];
                if (Request.Form.ContainsKey("parameters"))
                {
                    CodeGenerationViewModel codeParameters = JsonConvert.DeserializeObject<CodeGenerationViewModel>(Request.Form["parameters"]);
                    codeParameters.NumberOfCodes = 1; //hack to prevent error
                    CodeGenerationViewModelValidator parameterValidator = new CodeGenerationViewModelValidator();
                    ValidationResult validParameters = parameterValidator.Validate(codeParameters);
                    if (validParameters.IsValid)
                    {
                        var survey = await this._unitOfWork.Surveys.GetAsync(codeParameters.SurveyId);
                        if (survey.Owner == this.User.Identity.Name || await HasExecuteSurveyPermissions(codeParameters.SurveyId))
                        {
                            CodeGeneration codeGenerationParameters = _mapper.Map<CodeGeneration>(codeParameters);
                            string line;
                            int lineIndex = 1;
                            List<string> errorList = new List<string>();
                            List<string> groupNames = new List<string>();
                            using (StreamReader fileStream = new StreamReader(file.OpenReadStream()))
                            {
                                //for now assume valid line, generate a code per line (change later)
                                while ((line = fileStream.ReadLine()) != null)
                                {
                                    var lineSplit = line.Split(',');
                                    if (lineSplit.Count() != 1)
                                    {
                                        errorList.Add($"Error at line {lineIndex}: {line} - Skipped generation");
                                    }
                                    else
                                    {
                                        groupNames.Add(lineSplit[0]);
                                    }
                                }
                            }
                            codeGenerationParameters.NumberOfCodes = groupNames.Count;
                            this._codeGeneration.GenerateGroupCodesBatch(codeGenerationParameters, groupNames, survey);
                            await this._unitOfWork.SaveChangesAsync();
                            if (errorList.Count == 0)
                            {
                                return new OkResult();
                            }
                            else
                            {
                                AddErrors(errorList);
                                return BadRequest(ModelState);
                            }
                        }
                        return BadRequest("User does not have permissions to execute this survey.");
                    }
                    else
                    {
                        foreach (var error in validParameters.Errors)
                        {
                            ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                        }
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
                return BadRequest("Upload Failed: " + ex.Message);
            }
        }

        /// <summary>
        /// Check if user is group admin of given group
        /// </summary>
        /// <param name="id"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        private async Task<bool> IsGroupAdmin(string groupName)
        {
            var isGroupAdmin = await this._unitOfWork.GroupMembers.IsGroupAdminAsync(this.User.Identity.Name, groupName);
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

        /// <summary>
        /// Check if user has execute survey permissions
        /// </summary>
        /// <param name="surveyId"></param>
        /// <returns></returns>
        private async Task<bool> HasExecuteSurveyPermissions(int surveyId)
        {
            var surveyPermissions = await this._unitOfWork.SurveyPermissions.GetPermissionsForSurveyAsync(this.User.Identity.Name, surveyId);
            bool hasExecuteSurveyPermissions = surveyPermissions.Permissions.Contains("survey.execute");
            return hasExecuteSurveyPermissions;
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