using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Models.ViewModels;

namespace Traisi.ViewModels
{
    public class TermsAndConditionsPageLabelViewModel : LabelViewModel
    {
        public int Id { get; set; }
        public int SurveyViewId { get; set; }
    }

    public class TermsAndConditionsPageLabelViewModelValidator : AbstractValidator<TermsAndConditionsPageLabelViewModel>
    {
        public TermsAndConditionsPageLabelViewModelValidator()
        {

        }
    }
}
