using System;
using System.Collections.Generic;
using System.Text;

namespace Traisi.Data.Models.Groups
{
    public class EmailTemplate: AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string HTML { get; set; }
        public UserGroup Group { get; set; }
    }
}
