using System;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Newtonsoft.Json.Linq;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
	public class JsonResponse : ResponseValue, IJsonResponse
	{
		[Column(TypeName = "jsonb")]
		public string Value { get; set; }

    }

}