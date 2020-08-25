using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.Questions
{

	[SurveyQuestion(QuestionResponseType.None, CodeBundleName = "traisi-questions-general.module.js")]
	public class HeadingQuestion : ISurveyQuestion
	{
		public string TypeName
		{
			get => "heading";
		}
		public string Icon
		{
			get => "fas fa-heading";
		}
		public QuestionIconType IconType { get => QuestionIconType.FONT; }

	}

}
