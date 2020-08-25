using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models.Groups;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Models.Surveys;
using Microsoft.AspNetCore.Identity;

namespace Traisi.Data.Models
{
    public class TraisiUser : ApplicationUser
    {


        /// <summary>
        /// Navigation property for the groups this user belongs to.
        /// </summary>
        public virtual ICollection<GroupMember> Groups { get; set; }

        public virtual ICollection<SurveyPermission> SurveyPermissions { get; set; }
    }
}
