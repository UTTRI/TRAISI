using System.Collections.Generic;
using Traisi.Sdk.Enums;
namespace Traisi.Sdk.Interfaces
{
	public interface ISurveyResource
	{
		string ResourceName { get; }

		string Value { get; set; }


	}
}