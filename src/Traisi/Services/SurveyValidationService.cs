
using System.Collections.Generic;
using Traisi.Models.Surveys.Validation;
using Traisi.Data.Models.Surveys;
using Traisi.Services.Interfaces;
using Traisi.Data;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Sdk;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Enums;
using Traisi.ViewModels.SurveyViewer;
using Newtonsoft.Json.Linq;
using System;

namespace Traisi.Services
{
    /// <summary>
    /// 
    /// </summary>
    public class SurveyValidationService : ISurveyValidationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQuestionTypeManager _questionManager;
        public SurveyValidationService(IUnitOfWork unitOfWork, IQuestionTypeManager questions)
        {
            this._unitOfWork = unitOfWork;
            this._questionManager = questions;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="response"></param>
        /// <param name="respondent"></param>
        /// <returns></returns>
        public async Task<List<SurveyValidationError>> ListSurveyLogicErrorsForResponse(SurveyResponse response, SurveyRespondent respondent)
        {
            // find the survey logic referencing this response
            var logicTree = await this._unitOfWork.SurveyLogic.GetSurveyLogicExpressionTreeForQuestionAsync(response.QuestionPart);
            var uniqueRoots = logicTree.Select(s => s).Distinct().ToList();
            var results = new List<SurveyValidationError>();
            if (uniqueRoots.Count > 0 && uniqueRoots[0].ValidationQuestionId == response.QuestionPart.Id)
            {
                List<int> questionIds = new List<int>();
                List<List<int>> questionIdSplit = new List<List<int>>();
                foreach (var root in uniqueRoots)
                {
                    var list = new List<int>();
                    GetResponseValueIdsForLogicTree(root, list);
                    questionIds.AddRange(list);
                    questionIdSplit.Add(list);
                }

                var responses = await this._unitOfWork.SurveyResponses.ListSurveyResponsesForQuestionsAsync(questionIds, respondent);

                // remove existing
                responses.RemoveAll(x => x.QuestionPart.Id == response.QuestionPart.Id);

                // add upate to date response
                responses.Add(response);
                for (int i = 0; i < uniqueRoots.Count; i++)
                {
                    var u = uniqueRoots[i];
                    var result = EvaluateExpressionTree(u, responses);

                    if (result)
                    {
                        var logicError = new SurveyValidationError()
                        {
                            RelatedQuestions = questionIdSplit[i],
                            ValidationState = ValidationState.Invalid,
                            Messages = u.ValidationMessages,
                        };
                        results.Add(logicError);
                    }
                }
            }
            return results;
        }

        /// <summary>
        /// Returns the list of question part ids that are required for a logic tree expression
        /// </summary>
        /// <param name="logicTree"></param>
        /// <param name="ids"></param>
        private void GetResponseValueIdsForLogicTree(SurveyLogic logicTree, List<int> ids)
        {
            if (logicTree.QuestionId > 0)
            {
                ids.Add(logicTree.QuestionId.Value);
            }
            if (logicTree.LogicType == SurveyLogicType.Response)
            {
                if (int.TryParse(logicTree.Value, out var result))
                {
                    ids.Add(result);
                }
            }
            foreach (var child in logicTree.Expressions)
            {
                GetResponseValueIdsForLogicTree(child, ids);
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="logicGroup"></param>
        /// <param name="responses"></param>
        /// <returns></returns>
        private bool EvaluateExpressionTree(SurveyLogic logicGroup, List<SurveyResponse> responses)
        {
            var expressionResult = logicGroup.Expressions.Where(x => x.QuestionId > 0).All(x =>
            {
                var response = responses.Where(r => r.QuestionPart.Id == x.QuestionId).FirstOrDefault();
                return EvaluateExpression(response, x, responses);
            });
            var childResults = logicGroup.Expressions.Where(x => x.Operator != null).All(
                x => EvaluateExpressionTree(x, responses)
            );
            return expressionResult && childResults;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="response"></param>
        /// <param name="compareValue"></param>
        /// <param name="responses"></param>
        /// <returns></returns>
        private bool EvaluateExpression(SurveyResponse response, SurveyLogic compareValue, List<SurveyResponse> responses)
        {
            // return if response is not valid
            if (response == null)
            {
                return false;
            }
            // get definition
            var questionDefinition = _questionManager.QuestionTypeDefinitions[response.QuestionPart.QuestionType];

            switch (questionDefinition.ResponseType)
            {
                case QuestionResponseType.String:
                    return EvaluateTextComparison(response, compareValue);
                case QuestionResponseType.Number:
                    return EvaluateNumberComparsion(response, compareValue);
                case QuestionResponseType.OptionSelect:
                    return EvaluateOptionSelect(response, compareValue);
                case QuestionResponseType.Location:
                    return EvaluateLocation(response, compareValue, responses);
                default:
                    return false;
            }
        }

        public bool EvaluateNumberComparsion(SurveyResponse response, SurveyLogic compareValue)
        {
            if (compareValue.Operator == SurveyLogicOperator.Equals)
            {
                return (response.ResponseValues[0] as NumberResponse).Value == int.Parse(compareValue.Value);
            }
            else if (compareValue.Operator == SurveyLogicOperator.LessThan)
            {
                return (response.ResponseValues[0] as NumberResponse).Value < int.Parse(compareValue.Value);
            }
            else if (compareValue.Operator == SurveyLogicOperator.GreaterThan)
            {
                return (response.ResponseValues[0] as NumberResponse).Value > int.Parse(compareValue.Value);
            }
            else if (compareValue.Operator == SurveyLogicOperator.NotEquals)
            {
                return (response.ResponseValues[0] as NumberResponse).Value != int.Parse(compareValue.Value);
            }
            else if (compareValue.Operator == SurveyLogicOperator.GreaterThanEqualTo)
            {
                return (response.ResponseValues[0] as NumberResponse).Value >= int.Parse(compareValue.Value);
            }
            else if (compareValue.Operator == SurveyLogicOperator.LessThanEqualTo)
            {
                return (response.ResponseValues[0] as NumberResponse).Value <= int.Parse(compareValue.Value);
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="response"></param>
        /// <param name="logic"></param>
        /// <param name="responses"></param>
        /// <returns></returns>
        private bool EvaluateLocation(SurveyResponse response, SurveyLogic logic, List<SurveyResponse> responses)
        {
            if (logic.LogicType == SurveyLogicType.Response)
            {
                var compareResponse = responses.Find(r => r.QuestionPart.Id == int.Parse(logic.Value));

                if (compareResponse != null && compareResponse.ResponseValues.Count > 0 && response.ResponseValues.Count > 0)
                {
                    if (compareResponse.ResponseValues.Count < 1 || response.ResponseValues.Count < 1)
                    {
                        return false;
                    }
                    Address compareObj = null;
                    Address compareObj2 = null;
                    try
                    {
                        compareObj = (compareResponse.ResponseValues[0] as LocationResponse).Address;
                        compareObj2 = ((response.ResponseValues[0] as LocationResponse).Address);
                    }
                    catch 
                    {
                        return false;
                    }
                    var addr = compareObj.StreetAddress;
                    if (compareObj.StreetAddress == compareObj2.StreetAddress && compareObj.StreetNumber == compareObj2.StreetNumber &&
                    compareObj.PostalCode == compareObj2.PostalCode)

                    {
                        return true;
                    }
                }
            }
            return false;

        }

        private bool EvaluateOptionSelect(SurveyResponse response, SurveyLogic logic)
        {
            JToken[] jvalues = JToken.Parse(logic.Value).ToArray();
            // convert values to a list of strings
            List<string> values = new List<string>();
            foreach (var v in jvalues)
            {
                values.Add(v.Value<string>());
            }
            if (logic.Operator == SurveyLogicOperator.AllOf)
            {
                return response.ResponseValues.All(x =>
                {
                    return values.Contains((x as OptionSelectResponse).Code);
                });
            }
            else if (logic.Operator == SurveyLogicOperator.AnyOf)
            {
                return response.ResponseValues.Any(x =>
                {
                    return values.Contains((x as OptionSelectResponse).Code);
                });
            }
            else if (logic.Operator == SurveyLogicOperator.NoneOf)
            {
                return !response.ResponseValues.Any(x =>
                {
                    return values.Contains((x as OptionSelectResponse).Code);
                });
            }

            return false;
        }

        private bool EvaluateTextComparison(SurveyResponse response, SurveyLogic compareValue)
        {
            if (compareValue.Operator == SurveyLogicOperator.Equals)
            {
                return (response.ResponseValues[0] as StringResponse).Value.Equals(compareValue.Value);
            }
            else if (compareValue.Operator == SurveyLogicOperator.Contains)
            {
                return (response.ResponseValues[0] as StringResponse).Value.Contains(compareValue.Value);
            }
            else
            {
                return false;
            }
        }

        public List<SurveyValidationError> ListSurveyLogicErrorsForSurvey(Survey survey, SurveyRespondent respondent)
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// Validates the current response and its response value for any violations of survey
        /// control logic.
        /// </summary>
        /// <param name="response"></param>
        /// <returns></returns>
        public async Task<List<SurveyValidationError>> ValidateSurveyResponse(SurveyResponse response)
        {
            return await Task.FromResult<List<SurveyValidationError>>(new List<SurveyValidationError>());
        }
    }
}