using FluentValidation;
using Traisi.Models.ViewModels;

namespace Traisi.ViewModels.Questions
{
    public class QuestionOptionLabelViewModel : LabelViewModel
    {
        public int Id { get; set; }
        public int QuestionOptionId { get; set; }
    }

    public class QuestionOptionLabelViewModelValidator : AbstractValidator<QuestionOptionLabelViewModel>
    {
        public QuestionOptionLabelViewModelValidator()
        {
            RuleFor(o => o.Value).NotNull().NotEmpty().WithMessage("Option text cannot be empty");
            RuleFor(o => o.Language).NotNull().NotEmpty().WithMessage("Option must have a language");
        }
    }

}
