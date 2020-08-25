using System.Collections.Generic;

namespace Traisi.Data.Models.Surveys
{
    /// <summary>
    /// Sub Respondent type, associated with another primary respondent
    /// </summary>
    public class SubRespondent : SurveyRespondent
    {
        public PrimaryRespondent PrimaryRespondent { get; set; }
        public SubRespondent()
        {

        }
    }
}