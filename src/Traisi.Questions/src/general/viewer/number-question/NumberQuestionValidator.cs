using System;
using System.Collections.Generic;
using System.Linq;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    public class NumberQuestionValidator : ResponseValidator
    {
        public NumberQuestionValidator() { }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="data"></param>
        /// <param name="configuration"></param>
        /// <returns></returns>
        public override bool ValidateResponse(List<IResponseType> response, ICollection<IQuestionConfiguration> configuration)
        {

            if (response.Count == 0)
            {
                return false;
            }
            else
            {
                var data = (INumberResponse)response[0];
                var maxConfig = configuration.FirstOrDefault((config) => config.Name == NumberQuestionConfiguration.MAX_VALUE);
                var minConfig = configuration.FirstOrDefault((config) => config.Name == NumberQuestionConfiguration.MIN_VALUE);

                if (data.Value < double.Parse(minConfig.Value) || data.Value > double.Parse(maxConfig.Value))
                {
                    return false;
                }
            }

            return true;
        }
    }
}