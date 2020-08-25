using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using Traisi.Sdk.Interfaces;

namespace Traisi.Data.Models.Questions
{
	/// <summary>
	/// Configuration Data for question parts
	/// </summary>
	public class SurveyResource : ISurveyResource
	{
		[JsonIgnore]
		public int Id { get; set; }


		[Column(TypeName = "jsonb")]
		public string Value { get; set; }

		public string ResourceName { get; set; }
	}
}