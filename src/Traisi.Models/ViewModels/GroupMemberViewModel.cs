using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.ViewModels.Users;


namespace Traisi.ViewModels
{
    public class GroupMemberViewModel
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public UserViewModel User { get; set; }
        public string Group { get; set; }
        public DateTime DateJoined { get; set; }
        public Boolean GroupAdmin { get; set; }
    }
    
    public class GroupMemberViewModelValidator : AbstractValidator<GroupMemberViewModel>
    {
        public GroupMemberViewModelValidator()
        {
        }
    }
}
