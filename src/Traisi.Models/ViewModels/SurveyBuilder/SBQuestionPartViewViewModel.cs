using System.Collections.Generic;
using FluentValidation;
using Traisi.Models.ViewModels;

namespace Traisi.ViewModels.SurveyBuilder
{
	public class SBQuestionPartViewViewModel
	{
		public int Id { get; set; }

		public SBQuestionPartViewModel QuestionPart { get; set; }

		public LabelViewModel Label { get; set; }

		public LabelViewModel DescriptionLabel { get; set; }

		public int? ParentViewId { get; set; }

		public List<SBQuestionPartViewViewModel> QuestionPartViewChildren { get; set; }

		public int Order { get; set; }

		public bool isOptional { get; set; }
		public bool isHousehold { get; set; }
		public string repeatSourceQuestionName { get; set; }

		public string repeatSourceQuestionId {get;set;}

		public string Icon { get; set; }

		public bool IsMultiView { get; set; }

		public SBQuestionPartViewViewModel CATIDependent { get; set; }
	}

	public class SBQuestionPartViewViewModelValidator : AbstractValidator<SBQuestionPartViewViewModel>
	{
		public SBQuestionPartViewViewModelValidator()
		{
			RuleFor(part => part.Label).NotNull().WithMessage("Title must not be empty");
			RuleFor(part => part.Label.Value).NotEmpty().WithMessage("Text cannot be empty").When(p => p.Label != null);
			RuleFor(part => part.QuestionPart).SetValidator(new SBQuestionPartViewModelValidator()).When(p => p.QuestionPart != null);
		}
	}

}