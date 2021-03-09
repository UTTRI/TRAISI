using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Traisi.Data;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;
using Traisi.Helpers;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Questions;
using Traisi.Sdk.Services;
using Traisi.ViewModels;
using Newtonsoft.Json.Linq;
using System.Text.Json;


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

        private IQuestionTypeManager _questionTypeManager;

        public SurveyAnalyticsController(
            IUnitOfWork unitOfWork,
            IWebHostEnvironment hostingEnvironment,
            IFileDownloader fileDownloaderService,
            IAuthorizationService authorizationService,
            IAccountManager accountManager,
            IMapper mapper,
            IQuestionTypeManager questionTypeManager
        )
        {
            this._unitOfWork = unitOfWork;
            this._authorizationService = authorizationService;
            this._accountManager = accountManager;
            this._fileDownloader = fileDownloaderService;
            this._mapper = mapper;
            this._hostingEnvironment = hostingEnvironment;
            this._questionTypeManager = questionTypeManager;
        }

        [HttpGet("{surveyId}/{questionId}")]
        public async Task<IActionResult>
        ResponseStatistics(int surveyId, int questionId)
        {
            //Surveys
            var surveys =
                await this._unitOfWork.Surveys.GetSurveyFullAsync(surveyId, 0);

            //Survey Responses
            var surveyResponses =
                await this
                    ._unitOfWork
                    .DbContext
                    .SurveyResponses
                    .AsQueryable()
                    .Include(r => r.ResponseValues)
                    .Include(r => r.Respondent)
                    .ThenInclude(srg => srg.SurveyRespondentGroup)
                    .Include(r => r.QuestionPart).ToListAsync();

            //Survey Response Values
            var surveyResponseValues =
                await this
                    ._unitOfWork
                    .DbContext
                    .SurveyResponseValues
                    .AsQueryable()
                    .Include(sr => sr.SurveyResponse)
                    .ThenInclude(qp => qp.QuestionPart)
                    .ThenInclude(qo => qo.QuestionOptions)
                    .ThenInclude(qol => qol.QuestionOptionLabels)
                    .ToListAsync();

            //Survey Respondents
            var surveyRespondents =
                await this
                    ._unitOfWork
                    .DbContext
                    .PrimaryRespondents
                    .AsQueryable()
                    .Include(s => s.Survey)
                    .Where(item => item.Survey.Id == surveyId)
                    .ToListAsync();

            //complete
            var completedResponse =
                    surveyResponses
                    .Where(item =>
                        item.QuestionPart.Id == questionId &&
                        item.QuestionPart.SurveyId == surveyId).ToList();
                    
            var surveyCompleted =
                completedResponse
                    .Where(item => item.Respondent.HomeAddress != null)
                    .GroupBy(item => item.Respondent.HomeAddress.City);

            var completedResult =
                from item in surveyCompleted
                select new { City = item.Key, surveyCompleted = item.Count() };

            //incomplete
            var incompleteResponse =
                surveyResponses
                    .Where(item =>
                        item.QuestionPart.Id != questionId &&
                        item.QuestionPart.SurveyId == surveyId)
                    .ToList();

            var surveyIncompleted =
                incompleteResponse
                    .Where(item => item.Respondent.HomeAddress != null)
                    .GroupBy(item => item.Respondent.HomeAddress.City);

            var incompletedResult =
                from item in surveyIncompleted
                select
                new { City = item.Key, surveyIncompleted = item.Count() };

            //Responses based on QuestionType
            var question =
                await this
                    ._unitOfWork
                    .DbContext
                    .QuestionParts
                    .FindAsync(questionId);

            if (
                this
                    ._questionTypeManager
                    .QuestionTypeDefinitions[question.QuestionType]
                    .ResponseType ==
                QuestionResponseType.OptionSelect
            )
            {
                //QuestionType Responses
                var questTypeResponses =
                    surveyResponseValues
                        .Where(item =>
                            item.SurveyResponse.QuestionPart.Id == questionId &&
                            item.SurveyResponse.QuestionPart.SurveyId ==
                            surveyId)
                        .GroupBy(item => ((OptionSelectResponse) item).Code);

                //Question Options Labels
                var questionNames = question.QuestionOptions.ToList();
                var questOptionNames =
                    questionNames
                        .Where(x => x.Name == "Response Options")
                        .OrderBy(x => x.Order)
                        .ToList();

                //QuestionType results
                var questionTypeResults =
                    from item in questTypeResponses
                    select
                    new {
                        QuestionOption = item.Key,
                        Count = item.Count(),
                        Label =
                            question
                                .QuestionOptions
                                .FirstOrDefault(x => x.Code == item.Key)?
                                .QuestionOptionLabels["en"]
                                .Value
                    };

                //Final results

                var finalResults =
                    new {
                        totalComplete = completedResponse.Count(),
                        totalIncomplete = incompleteResponse.Count(),
                        completedResponses = completedResult,
                        incompletedResponses = incompletedResult,
                        questionTypeResults =
                            questionTypeResults
                                .OrderBy(x =>
                                    questionNames
                                        .FirstOrDefault(y =>
                                            y.Code == x.QuestionOption)?
                                        .Order)
                    };
                return Ok(finalResults);
            }
            //Matrix question
            else if (
                this
                    ._questionTypeManager
                    .QuestionTypeDefinitions[question.QuestionType]
                    .ClassName ==
                typeof (MatrixQuestion).Name
            )
            { 
                //Matrix question type responses
                var matrixResults = new
                {
                    Label = question.Name,
                    Count = completedResponse.Count()
                };
                var result  = new {   matrixResults  = matrixResults};
                return Ok(result); 
            } 
            else
            {
                // default case count how many answers exist
                //final result
                var finalResults =
                    new {
                        totalComplete = completedResponse.Count(),
                        totalIncomplete = incompleteResponse.Count(),
                        completedResponses = completedResult,
                        incompletedResponses = incompletedResult
                    };
                return Ok(finalResults);
            }
        }

        [HttpGet("{surveyId}")]
        public IActionResult GetQuestionNameList(int surveyId)
        {
            var questionParts =
                this
                    ._unitOfWork
                    .QuestionParts
                    .GetAll()
                    .Where(item => item.SurveyId == surveyId)
                    .ToList();
            var result =
                from item in questionParts
                select
                new {
                    Id = item.Id,
                    Name = item.Name,
                    Type = item.QuestionType
                };
            return Ok(result);
        }
    }
}
