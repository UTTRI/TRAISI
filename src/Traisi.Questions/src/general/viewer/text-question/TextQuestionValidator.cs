using System;
using System.Collections.Generic;
using System.Linq;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{

    public class TextQuestionValidator : ResponseValidator
    {

        public TextQuestionValidator() { }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="data"></param>
        /// <param name="configuration"></param>
        /// <returns></returns>
        public override bool ValidateResponse(List<IResponseType> response, ICollection<IQuestionConfiguration> configuration)
        {
            /*var maxLengthConfig = configuration.FirstOrDefault ((config) => config.Name == TextQuestionConfiguration.MAX_LENGTH);
			if (maxLengthConfig != null && response.Count > 0) {
				var data = (IStringResponse) response[0];
				if (data.Value.Length > int.Parse (maxLengthConfig.Value)) {
					return false;
				}

			}*/
            return true;
        }
    }
}