using System;
using System.Collections.Generic;
using System.Text;

using Traisi.Data.Core;

namespace Traisi.Data.Models.Groups
{
    public class UserGroup : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ApiKeys ApiKeySettings { get; set; }
        public virtual ICollection<GroupMember> Members { get; set; }
        public virtual ICollection<EmailTemplate> EmailTemplates { get; set; }
    }
}
