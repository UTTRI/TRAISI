using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Traisi.ViewModels.Users
{
    public class UserGroupViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public GroupMemberViewModel[] Members { get; set; }
    }
    
    public class UserGroupViewModelValidator : AbstractValidator<UserGroupViewModel>
    {
        public UserGroupViewModelValidator()
        {
            RuleFor(register => register.Name).NotEmpty().WithMessage("Survey name cannot be empty");
        }
    }
}
