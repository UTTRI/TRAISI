using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NetTopologySuite.Geometries;
using Newtonsoft.Json.Linq;
using Traisi.Data;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;
using Traisi.Models.Surveys.Validation;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;
using Traisi.Services.Interfaces;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.Services
{
    /// <summary>
    /// Service for handling business logic related to respondents and the updating and querying
    /// of survey responses.
    /// </summary>
    public class SurveyResponseService : ISurveyResponseService
    {
        private IUnitOfWork _unitOfWork;

        private IQuestionTypeManager _questionTypeManager;

        private ILoggerFactory _loggerFactory;

        private ILogger<SurveyResponseService> _logger;

        private IRespondentGroupService _respondentGroupService;

        private readonly ISurveyValidationService _validation;

        public static readonly string LOCATION_RESPONSE = "location";

        public static readonly string TIMELINE_RESPONSE = "location";

        /// <summary>
        ///
        /// </summary>
        /// <param name="_unitOfWork"></param>
        /// <param name="manager"></param>
        /// <param name="loggerFactory"></param>
        public SurveyResponseService(
            IUnitOfWork _unitOfWork,
            ISurveyValidationService validation,
            IQuestionTypeManager manager,
            ILoggerFactory loggerFactory,
            IRespondentGroupService respondentGroupService
        )
        {
            this._unitOfWork = _unitOfWork;
            this._questionTypeManager = manager;
            this._validation = validation;
            this._respondentGroupService = respondentGroupService;
            _loggerFactory = loggerFactory;
            _logger = loggerFactory.CreateLogger<SurveyResponseService>();
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="questionId"></param>
        /// <param name="subRespondentId"></param>
        /// <param name="responseData"></param>
        /// <returns></returns>
        public async Task<SurveyResponseValidationState>
        SaveSubResponse(
            int questionId,
            int subRespondentId,
            JObject responseData
        )
        {
            var respondent =
                await this
                    ._unitOfWork
                    .SurveyRespondents
                    .GetSubRespondentAsync(subRespondentId);
            return new SurveyResponseValidationState() { IsValid = true };
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="questionpart"></param>
        /// <param name="respondent"></param>
        /// <returns></returns>
        public async Task ExcludeResponse(Survey survey, int[] questionIds, SurveyRespondent respondent, bool exclude = true)
        {
            var surveyResponses =
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .ListSurveyResponsesForQuestionsAsync(questionIds.ToList(), (SurveyRespondent)respondent);
            if (surveyResponses != null)
            {
                foreach (var response in surveyResponses)
                {
                    response.Excluded = exclude;
                }
            }
            await this._unitOfWork.SaveChangesAsync();
            return;

        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="responseData"></param>
        /// <param name="repeat"></param>
        /// <returns></returns>
        public async Task<SurveyResponseValidationState>
        SaveResponse(
            Survey survey,
            QuestionPart question,
            SurveyRespondent respondent,
            JArray responseData,
            int repeat,
            bool force
        )
        {
            var type =
                this
                    ._questionTypeManager
                    .QuestionTypeDefinitions[question.QuestionType];


            if (type.ResponseValidator != null)
            {
                var responseDataUnwrapped =
                    this.UnwrapResponseData(type.ResponseType, responseData);
                if (
                    !type
                        .ResponseValidator
                        .ValidateResponse(responseDataUnwrapped,
                        question
                            .QuestionConfigurations
                            .Cast<IQuestionConfiguration>()
                            .ToHashSet())
                )
                {
                    return new SurveyResponseValidationState()
                    { IsValid = false };
                }
            }

            var surveyResponse =
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .GetMostRecentResponseForQuestionByRespondentAsync(question
                        .Id,
                    (SurveyRespondent)respondent,
                    repeat);

            if (
                surveyResponse == null ||
                surveyResponse.SurveyAccessRecord.AccessDateTime <
                respondent
                    .SurveyRespondentGroup
                    .GroupPrimaryRespondent
                    .SurveyAccessRecords
                    .Max(t => t.AccessDateTime)
            )
            {
                if (respondent is PrimaryRespondent primaryRespondent)
                {
                    surveyResponse =
                        new SurveyResponse()
                        {

                            QuestionPart = question,
                            Respondent = respondent,
                            SurveyAccessRecord =
                                primaryRespondent
                                    .SurveyAccessRecords
                                    .Where(s =>
                                        s.AccessDateTime ==
                                        primaryRespondent
                                            .SurveyAccessRecords
                                            .Max(s2 => s2.AccessDateTime))
                                    .FirstOrDefault(),
                            Repeat = repeat
                        };
                }
                else if (respondent is SubRespondent subRespondent)
                {
                    primaryRespondent =
                        subRespondent
                            .SurveyRespondentGroup
                            .GroupPrimaryRespondent;
                    surveyResponse =
                        new SurveyResponse()
                        {
                            QuestionPart = question,
                            Respondent = respondent,
                            SurveyAccessRecord =
                                primaryRespondent
                                    .SurveyAccessRecords
                                    .Where(r =>
                                        r.AccessDateTime ==
                                        primaryRespondent
                                            .SurveyAccessRecords
                                            .Max(s => s.AccessDateTime))
                                    .FirstOrDefault(),
                            Repeat = repeat
                        };
                }
            }
            // unset excluded flag
            surveyResponse.Excluded = false;
            List<SurveyValidationError> errorList =
                new List<SurveyValidationError>();
            switch (type.ResponseType)
            {
                case QuestionResponseType.String:
                    SaveStringResponse(survey,
                    question,
                    responseData.First().ToObject<StringResponse>(),
                    surveyResponse);
                    break;
                case QuestionResponseType.Number:
                    SaveNumberResponse(survey,
                    question,
                    responseData.First().ToObject<NumberResponse>(),
                    surveyResponse);
                    break;
                case QuestionResponseType.DateTime:
                    SaveDateTimeResponse(surveyResponse,
                    responseData.First().ToObject<DateTimeResponse>());
                    break;
                case QuestionResponseType.Json:
                    SaveJsonResponse(surveyResponse, responseData);
                    break;
                case QuestionResponseType.Location:
                    SaveLocationResponse(survey,
                    question,
                    responseData.First().ToObject<LocationLatLngResponse>(),
                    surveyResponse);
                    break;
                case QuestionResponseType.Timeline:
                    SaveTimelineResponse(surveyResponse,
                    responseData.ToObject<List<TimelineTmpResponse>>());
                    break;
                case QuestionResponseType.OptionSelect:
                    SaveOptionSelectResponse(survey,
                    question,
                    responseData.ToObject<List<OptionSelectResponse>>(),
                    surveyResponse);
                    break;
            }
            try
            {
                var errors =
                    await this
                        ._validation
                        .ListSurveyLogicErrorsForResponse(surveyResponse,
                        respondent);
                errorList.AddRange(errors);
                if (type.Hook != null)
                {
                    type.Hook.Execute(respondent, surveyResponse.ResponseValues.Cast<IResponseType>(), surveyResponse.QuestionPart.QuestionConfigurations.Cast<IQuestionConfiguration>());
                }
                if (errorList.Count == 0 || force)
                {
                    this._unitOfWork.SurveyResponses.Update(surveyResponse);

                }
                await this._unitOfWork.SaveChangesAsync();
                return new SurveyResponseValidationState()
                {
                    IsValid = errorList.Count == 0 || force ? true : false,
                    SurveyLogicError =
                        errorList.Count > 0 && !force
                            ? new SurveyValidationError()
                            {
                                RelatedQuestions =
                                    errorList[0].RelatedQuestions,
                                ValidationState = ValidationState.Invalid,
                                Messages = errorList[0].Messages
                            }
                            : new SurveyValidationError()
                            { ValidationState = ValidationState.Valid },
                    SurveyQuestionValidationError =
                        new SurveyValidationError()
                        { ValidationState = ValidationState.Valid }
                };
            }
            catch (Exception e)
            {
                this._logger.LogError(e, "Error saving response.");
                return new SurveyResponseValidationState() { IsValid = false };
            }
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="repeat"></param>
        /// <returns></returns>
        private async Task<SurveyResponse>
        GenerateSurveyResponse(
            QuestionPart question,
            SurveyRespondent respondent,
            int repeat
        )
        {
            return await this
                ._unitOfWork
                .SurveyResponses
                .GetMostRecentResponseForQuestionByRespondentAsync(question.Id,
                (SurveyRespondent)respondent,
                repeat);
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="response"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        internal List<IResponseType>
        UnwrapResponseData(QuestionResponseType responseType, JArray response)
        {
            switch (responseType)
            {
                case QuestionResponseType.OptionSelect:
                    return response["values"]
                        .ToObject<List<IOptionSelectResponse>>()
                        .Cast<IResponseType>()
                        .ToList();
                case QuestionResponseType.Timeline:
                    return response["values"]
                        .ToObject<List<ITimelineResponse>>()
                        .Cast<IResponseType>()
                        .ToList();
                case QuestionResponseType.DateTime:
                    return new List<IResponseType>()
                    { response[0].ToObject<DateTimeResponse>() };
                case QuestionResponseType.String:
                    return new List<IResponseType>()
                    { response[0].ToObject<StringResponse>() };
                   case QuestionResponseType.Number:
                    return new List<IResponseType>()
                    { response[0].ToObject<NumberResponse>() };
                case QuestionResponseType.Location:
                    return new List<IResponseType>()
                    { response[0].ToObject<LocationResponse>() };
                case QuestionResponseType.Json:
                    return new List<IResponseType>()
                    { response[0].ToObject<JsonResponse>() };
                default:
                    break;
            }
            return null;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="response"></param>
        /// <param name="responseData"></param>
        internal void SavePathResponse(
            SurveyResponse response,
            JObject responseData
        )
        {
            response.ResponseValues.Clear();
            return;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="responseData"></param>
        /// <returns></returns>
        internal void SaveStringResponse(
            Survey survey,
            QuestionPart question,
            StringResponse responseData,
            SurveyResponse response
        )
        {
            if (response.ResponseValues.Count == 0)
            {
                //response.ResponseValues = new List<ResponseValue>();
                response.ResponseValues.Add(new StringResponse());
            }
            (response.ResponseValues[0] as StringResponse).Value =
                responseData.Value;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="responseData"></param>
        /// <param name="response"></param>
        internal void SaveNumberResponse(
            Survey survey,
            QuestionPart question,
            NumberResponse responseData,
            SurveyResponse response
        )
        {
            if (response.ResponseValues.Count == 0)
            {
                response.ResponseValues.Add(new NumberResponse());
            }
            (response.ResponseValues[0] as NumberResponse).Value =
                responseData.Value;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="response"></param>
        /// <param name="responseData"></param>
        internal void SaveJsonResponse(
            SurveyResponse response,
            object responseData
        )
        {
            response.ResponseValues.Clear();
            if (response.ResponseValues.Count == 0)
            {
                response.ResponseValues.Add(new JsonResponse());
            }
            var responseString = responseData.ToString();
            (response.ResponseValues[0] as JsonResponse).Value = responseString;

            return;
        }

        internal void SaveDateTimeResponse(
            SurveyResponse response,
            DateTimeResponse responseData
        )
        {
            if (response.ResponseValues.Count == 0)
            {
                response.ResponseValues.Add(new DateTimeResponse());
            }
            (response.ResponseValues[0] as DateTimeResponse).Value =
                responseData.Value;
            return;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="responseData"></param>
        /// <param name="response"></param>
        internal void SaveOptionSelectResponse(
            Survey survey,
            QuestionPart question,
            List<OptionSelectResponse> responseData,
            SurveyResponse response
        )
        {
            response.ResponseValues.Clear();
            foreach (var val in responseData)
            {
                response
                    .ResponseValues
                    .Add(new OptionSelectResponse()
                    { Value = val.Value, Code = val.Code });
            }
            return;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="response"></param>
        /// <returns></returns>
        internal void SaveTimelineResponse(
            SurveyResponse response,
            List<TimelineTmpResponse> responseData
        )
        {
            List<TimelineResponse> values = new List<TimelineResponse>();
            foreach (var responseValue in responseData)
            {
                values
                    .Add(new TimelineResponse()
                    {
                        Address = responseValue.Address,
                        Name = responseValue.Name,
                        Purpose = responseValue.Purpose,
                        Order = responseValue.Order,
                        TimeA = responseValue.TimeA,
                        TimeB = responseValue.TimeB,
                        Mode = responseValue.Mode,
                        Identifier = responseValue.Identifier,
                        Location =
                            new Point(responseValue.Longitude,
                                responseValue.Latitude)
                    });
            }
            response.ResponseValues.Clear();
            response.ResponseValues.AddRange(values);
            return;
        }

        internal void SaveRangeResponse(
            SurveyResponse response,
            JObject responseData
        )
        {
            if (response.ResponseValues.Count == 0)
            {
                //response.ResponseValues = new List<ResponseValue>();
                response.ResponseValues.Add(new DecimalResponse());
            }

            (response.ResponseValues[0] as DecimalResponse).Value =
                responseData.GetValue("value").ToObject<double>();
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="question"></param>
        /// <param name="respondent"></param>
        /// <param name="responseData"></param>
        /// <returns></returns>
        internal void SaveLocationResponse(
            Survey survey,
            QuestionPart question,
            LocationLatLngResponse responseData,
            SurveyResponse response
        )
        {
            if (response.ResponseValues.Count == 0)
            {
                response.ResponseValues.Add(new LocationResponse());
            }
            (response.ResponseValues[0] as LocationResponse).Location =
                new Point(responseData.Longitude, responseData.Latitude);
            (response.ResponseValues[0] as LocationResponse).Address = responseData.Address;
            return;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="shortcode"></param>
        /// <param name="questionId"></param>
        /// <param name="responseData"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>>
        ListResponses(int surveyId, string questionId)
        {
            var responses =
                await this._unitOfWork.SurveyResponses.GetAllAsync();
            return new List<SurveyResponse>();
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="type"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>>
        ListResponsesOfType(
            int surveyId,
            QuestionResponseType responseType,
            ApplicationUser user
        )
        {
            var respondent =
                await this
                    ._unitOfWork
                    .SurveyRespondents
                    .GetPrimaryRespondentForUserAsync(user);
            if (respondent == null)
            {
                await this
                    ._unitOfWork
                    .SurveyRespondents
                    .CreatePrimaryResponentForUserAsnyc(user);
            }
            var result =
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .ListSurveyResponsesForRespondentByTypeAsync(surveyId,
                    respondent,
                    responseType);
            return result;
        }

        /// <summary>
        ///
        /// </summary>
        /// <typeparam name="List"></typeparam>
        /// <returns></returns>
        public async Task<SurveyResponse>
        GetRespondentMostRecentResponseForQuestion(
            int surveyId,
            int questionId,
            int respondentId,
            int repeat,
            ApplicationUser user
        )
        {
            var respondent =
                await this._unitOfWork.SurveyRespondents.GetAsync(respondentId);
            var response =
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .GetMostRecentResponseForQuestionByRespondentAsync(questionId,
                    respondent,
                    repeat);

            return response;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="respondent"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>>
        ListSurveyResponsesForQuestionsAsync(
            List<int> questionIds,
            SurveyRespondent respondent
        )
        {
            var responses =
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .ListSurveyResponsesForQuestionsAsync(questionIds,
                    respondent);
            return responses;
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="questionIds"></param>
        /// <param name="respondents"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>>
        ListSurveyResponsesForQuestionsMultipleRespondentsAsync(
            List<int> questionIds,
            List<int> respondents
        )
        {
            var responses =
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .ListSurveyResponsesForQuestionsAsync(questionIds,
                    respondents);
            return responses;
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="questionNames"></param>
        /// <param name="respondent"></param>
        /// <returns></returns>
        public async Task<List<SurveyResponse>>
        ListSurveyResponsesForQuestionsByNameAsync(
            List<string> questionNames,
            SurveyRespondent respondent
        )
        {
            return await this
                ._unitOfWork
                .SurveyResponses
                .ListMostRecentSurveyResponsesForQuestionsByNameAsync(questionNames,
                respondent);
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="respondentId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task<bool>
        RemoveAllResponses(int surveyId, int respondentId, ApplicationUser user)
        {
            var respondent =
                await this
                    ._unitOfWork
                    .SurveyRespondents
                    .GetPrimaryRespondentForUserAsync(user);
            respondent.Name = null;
            respondent.Email = null;
            respondent.PhoneNumber = null;
            var members = respondent.SurveyRespondentGroup.GroupMembers;
            var toDelete = new List<SurveyRespondent>();
            foreach (var member in members)
            {
                await this
                    ._unitOfWork
                    .SurveyResponses
                    .DeleteAllResponsesForUser(member, surveyId);
                if (member.Id != respondent.Id)
                {
                    toDelete.Add(member);
                }
            }
            await this._unitOfWork.SaveChangesAsync();
            foreach (var r in toDelete)
            {
                await this
                    ._respondentGroupService
                    .RemoveRespondent(respondent.SurveyRespondentGroup, r);
            }

            // this._unitOfWork.SurveyRespondents.RemoveRange(toDelete);
            await this._unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
