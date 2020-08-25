using System.Collections.Generic;
using Traisi.ViewModels.Questions;
using FluentValidation;

namespace Traisi.ViewModels.SurveyBuilder
{
    public class SBQuestionPartViewModel
    {
        public int Id { get; set; }

        public string QuestionType { get; set; }

        public string Name { get; set; }

        public ICollection<SBQuestionPartViewModel> QuestionPartChildren { get; set; }

        //Whether this question part is responded to by the respondent group
        public bool IsGroupQuestion { get; set; } = false;
    }

    public class SBQuestionPartViewModelValidator : AbstractValidator<SBQuestionPartViewModel>
    {
        public SBQuestionPartViewModelValidator()
        {
            RuleFor(q => q.Name).NotNull().NotEmpty().WithMessage("Question must have a name");
        }
    }

}