using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;

namespace Traisi.ViewModels.Questions
{
    public class QuestionOptionConditionalViewModel
    {
		public int Id { get; set; }
        public int TargetOptionId { get; set; }
        public int SourceQuestionId { get; set; }
        public string Condition { get; set; }
        public string Value { get; set; }
    }

    public class QuestionOptionConditionalViewModelValidator : AbstractValidator<QuestionOptionConditionalViewModel>
    {
        public QuestionOptionConditionalViewModelValidator()
        {
            RuleFor(q => q.TargetOptionId).NotEmpty().WithMessage("Condition target must be specified");
            RuleFor(q => q.SourceQuestionId).NotEmpty().WithMessage("Condition source must be specified");
            RuleFor(q => q.Condition).NotEmpty().WithMessage("Condition must be specified");
            RuleFor(q => q.Value).NotEmpty().WithMessage("Condition value must be specified");
        }
    }
}
