using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Traisi.Models.ViewModels;

namespace Traisi.ViewModels.Questions
{
    public class QuestionOptionValueViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public LabelViewModel OptionLabel { get; set; }
        public int Order { get; set; }
    }

    public class QuestionOptionValueViewModelValidator : AbstractValidator<QuestionOptionValueViewModel>
    {
        public QuestionOptionValueViewModelValidator()
        {
            // RuleFor(o => o.OptionLabel).SetValidator(new QuestionOptionLabelViewModelValidator());
        }
    }
}
