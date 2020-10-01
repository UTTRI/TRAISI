
using System.Collections;
using System.Collections.Generic;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk
{
    /// <summary>
    /// Simple Hook - Run after a successful response save. This can be used to make meta adjustments to respondents or response values outside
    /// the scope of regular question functionality.
    /// </summary>
    public abstract class QuestionHook
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="respondent"></param>
        /// <param name="responseValues"></param>
        /// <param name="config"></param>
        public abstract void Execute(ISurveyRespondent respondent, IEnumerable<IResponseType> responseValues, IEnumerable<IQuestionConfiguration> config);
    }
}