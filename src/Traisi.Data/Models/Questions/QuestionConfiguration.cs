using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;
using Traisi.Sdk.Enums;
using Newtonsoft.Json;
using Traisi.Sdk.Interfaces;
using System.Collections;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Models.Questions
{
	/// <summary>
	/// Configuration Data for question parts
	/// </summary>
	public class QuestionConfiguration : IQuestionConfiguration
	{
		[JsonIgnore]
		public int Id { get; set; }

		/// <summary>
		/// The name or "key" of this configuration - it should be object and javascript friendly -- ie no spaces
		/// </summary>
		/// <value></value>
		public string Name { get; set; }

		/// <summary>
		/// Serialized representation of some form of data.
		/// </summary>
		/// <value></value>
		public string Value { get; set; }

		/// <summary>
		/// Resource only configurations should tell the builder they are not alterable - just for display purposes.
		/// </summary>
		/// <value></value>
		public bool IsResourceOnly { get; set; }

		/// <summary>
		/// Holds discriminator information to identity the type of data that is serialized in the Value field.
		/// </summary>
		/// <value></value>
		public ConfigurationValueType ValueType { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <value></value>
		public LabelCollection<Label> QuestionConfigurationLabels { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <value></value>
		public bool IsSourceInputRequired { get; set; }
	}

}