using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Models.ViewModels;

namespace Traisi.ViewModels
{
    public class WelcomePageLabelViewModel : LabelViewModel
    {
        public int Id { get; set; }
        public int SurveyViewId { get; set; }
    }

    public class WelcomePageLabelViewModelValidator : AbstractValidator<WelcomePageLabelViewModel>
    {
        public WelcomePageLabelViewModelValidator()
        {

        }
    }
}
