using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace Traisi.ViewModels
{
	public class CodeGenerationViewModel
	{
		public int Id { get; set; }
		public int SurveyId { get; set; }
		public string GroupName { get; set; }
		public string Pattern { get; set; }
		public int CodeLength { get; set; }
		public int NumberOfCodes { get; set; }
		public Boolean IsGroupCode { get; set; }
		public Boolean UsePattern { get; set; }
		public Boolean IsTest { get; set; }
	}

	public class CodeGenerationViewModelValidator : AbstractValidator<CodeGenerationViewModel>
	{
		public CodeGenerationViewModelValidator()
		{
			RuleFor(register => register.Pattern).Cascade(CascadeMode.StopOnFirstFailure).NotNull().Must(pattern => this.IsValidCodePattern(pattern.ToUpper())).WithMessage("Incorrect pattern: Must contain only 'C' and '#' and be between 6 and 10 characters").When(p => p.UsePattern);
			RuleFor(register => register.CodeLength).InclusiveBetween(6,10).WithMessage("Code length must be between 6 and 10.").When(p => !p.UsePattern);
			RuleFor(register => register.UsePattern).NotNull().WithMessage("UsePattern field must not be empty");
			RuleFor(register => register.IsGroupCode).NotNull().WithMessage("IsGroupCode field must not be empty");
			RuleFor(register => register.IsTest).NotNull().WithMessage("IsTest field must not be empty");
			RuleFor(register => register.SurveyId).NotNull().WithMessage("Survey is not specified");
			RuleFor(register => register.NumberOfCodes).GreaterThan(0).WithMessage("Number of codes to generate must be greater than 0").When(g => !g.IsGroupCode);
		}

		private bool IsValidCodePattern(string pattern)
		{
			Regex patternValidator = new Regex("^[C#-]*$");
			var codeLength = pattern.Count(x => x == 'C' || x == '#');
			if (patternValidator.IsMatch(pattern) && codeLength >= 6 && codeLength <= 10)
			{
				return true;
			}
			return false;
		}
	}



}