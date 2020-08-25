using System.Collections.Generic;
using Traisi.Sdk;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{
    public class DateQuestionValidator : ResponseValidator
    {

        public DateQuestionValidator()
        {

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="data"></param>
        /// <param name="configuration"></param>
        /// <returns></returns>
        public override bool ValidateResponse(List<IResponseType> data, ICollection<IQuestionConfiguration> configuration)
        {
            return true;
        }
    }
}