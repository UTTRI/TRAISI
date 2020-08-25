

namespace Traisi.Sdk.Interfaces
{
	/// <summary>
	/// Stores a single configuration value that belongs to a question configuration
	/// </summary>
	public interface IQuestionConfiguration
	{

		int Id { get; set; }

		string Name { get; set; }


		string Value { get; set; }

		/// <summary>
		/// Is this configuration a resource ?
		/// </summary>
		/// <value></value>
		bool IsResourceOnly { get; set; }

		/// <summary>
		/// Flags this question configuration to force builder / user to only seed these values with the data
		/// from another configuration or option value - or from some resource that is used.
		/// </summary>
		/// <value></value>
		bool IsSourceInputRequired { get; set; }

	}
}