using System;
using System.Collections.Generic;
using System.IO;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk {
	public abstract class ResponseValidator {
		public abstract bool ValidateResponse (List<IResponseType> data, ICollection<IQuestionConfiguration> configuration);
	}
}