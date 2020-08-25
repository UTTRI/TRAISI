using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traisi.Data.Models.Surveys
{
    public class SurveyRespondentGroup : ISurveyRespondentGroup
    {
        public int Id { get; set; }

        public List<SurveyRespondent> GroupMembers { get; set; }

        public PrimaryRespondent GroupPrimaryRespondent { get; set; }

        [ForeignKey("GroupPrimaryRespondent")]
        public int? GroupPrimaryRespondentId {get;set;}

        public SurveyRespondentGroup()
        {
            //this.GroupMembers = new HashSet<SurveyRespondent>();
            this.GroupMembers = new List<SurveyRespondent>();
        }
    }
}