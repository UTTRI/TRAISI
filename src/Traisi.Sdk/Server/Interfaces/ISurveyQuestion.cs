using System.Collections.Generic;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk.Interfaces
{
	public interface ISurveyQuestion
	{
		string  TypeName { get;  }

		string Icon { get;  }

		QuestionIconType IconType { get; }



	}
}