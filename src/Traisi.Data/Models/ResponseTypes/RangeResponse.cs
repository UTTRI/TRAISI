using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
	public class RangeResponse : ResponseValue, IRangeResponse
	{
		public double MinValue { get; set; }

		public double MaxValue { get; set; }

	}
}