using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Traisi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Traisi.Helpers;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Traisi.Controllers
{
    //[Authorize(Authorization.Policies.AccessAdminPolicy)]
    [Route("api/[controller]")]
    public class SurveyAnalyticsController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthorizationService _authorizationService;
        private readonly IAccountManager _accountManager;
        private readonly IFileDownloader _fileDownloader;
        private readonly IMapper _mapper;
        private IWebHostEnvironment _hostingEnvironment;

        public SurveyAnalyticsController(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment,
        IFileDownloader fileDownloaderService, IAuthorizationService authorizationService,
         IAccountManager accountManager, IMapper mapper)
        {
            this._unitOfWork = unitOfWork;
            this._authorizationService = authorizationService;
            this._accountManager = accountManager;
            this._fileDownloader = fileDownloaderService;
            this._mapper = mapper;
            this._hostingEnvironment = hostingEnvironment;
        }

        [HttpGet("{surveyId}")]
        public async Task<IActionResult> ResponseStatistics(int surveyId)
        {
            var surveys = await this._unitOfWork.Surveys.GetSurveyFullAsync(surveyId, 0);

            var surveyResponses = await this._unitOfWork.DbContext.SurveyResponses
                                        .AsQueryable()
                                        .Include(r => r.ResponseValues)
                                        .Include(r => r.Respondent)
                                        .Include(r => r.QuestionPart)
                                        .ToListAsync();
            var surveyRespondents = this._unitOfWork.DbContext.PrimaryRespondents
                                        .AsQueryable()
                                        .Include(s => s.Survey)
                                        .Where(item => item.Survey.Id == surveyId).ToList();

            var surveyViews = surveys.SurveyViews[0]
                                     .QuestionPartViews
                                     .OrderBy(o => o.Order).Last();

            var questPartId = surveyViews.QuestionPartViewChildren[0]
                                         .QuestionPartViewChildren[0]
                                         .QuestionPart.Id;
            //complete
            var completedResponse = surveyResponses.Where(item => item.QuestionPart.Id == questPartId).ToList();
            var surveyCompleted = completedResponse.Where(item => item.Respondent.HomeAddress != null).GroupBy(item => item.Respondent.HomeAddress.City);
            var completedResult = from item in surveyCompleted
                                    select new
                                    {
                                        City = item.Key,
                                        surveyCompleted = item.Count()
                                    };
            //incomplete
            var incompleteResponse = surveyResponses.Where(item => item.QuestionPart.Id != questPartId).ToList();
            var surveyIncompleted = incompleteResponse.Where(item => item.Respondent.HomeAddress != null).GroupBy(item => item.Respondent.HomeAddress.City);
            var incompletedResult = from item in surveyIncompleted
                                    select new
                                    {
                                        City = item.Key,
                                        surveyIncompleted = item.Count()
                                    };
            //final result                        
            var finalResults = new
            {
                totalComplete = completedResponse.Count(),
                totalIncomplete = incompleteResponse.Count(),
                completedResponses = completedResult,
                incompletedResponses = incompletedResult,
            };
            return Ok(finalResults);
        }
    }
}