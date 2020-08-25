using System;
using Traisi.Services;
using Xunit;
using Moq;
using Traisi.Data.Models.Surveys;
using Traisi.Data;
using Traisi.Data.Models.Questions;
using System.Collections.Generic;
using Traisi.Data.Models.ResponseTypes;

namespace Traisi.UnitTests.Services
{
    public class SurveyValidationServiceUnitTests : IDisposable
    {

        private readonly SurveyValidationService _validationService;
        private readonly IUnitOfWork _unitOfWork;
        public SurveyValidationServiceUnitTests()
        {
            this._unitOfWork = Utility.CreateUnitOfWork();
            this._validationService = new SurveyValidationService(this._unitOfWork, Utility.CreateQuestionTypeManager());

        }

        [Fact]
        public async void SingleLayerExpression_StringEquals_ReturnsValidationError()
        {
            SurveyResponse response = new SurveyResponse();
            response.ResponseValues = new List<ResponseValue>();
            (response.ResponseValues[0] as StringResponse).Value = "test";
            SurveyRespondent respondent = new PrimaryRespondent();
            response.Respondent = respondent;
            QuestionPart questionPart = new QuestionPart()
            {
                Id = 1
            };
            response.QuestionPart = questionPart;

            SurveyLogic logic = new SurveyLogic()
            {
                Id = 1
            };
            logic.Condition = SurveyLogicCondition.And;
            logic.Expressions.Add(new SurveyLogic()
            {
                RootId = 1,
                QuestionId = 1,
                Operator = SurveyLogicOperator.Equals,
                Value = "wrongtest"
            });

            this._unitOfWork.SurveyResponses.Add(response);

            await this._validationService.ListSurveyLogicErrorsForResponse(response, respondent);

        }

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}