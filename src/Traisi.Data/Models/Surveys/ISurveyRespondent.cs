using System.Collections.Generic;

namespace Traisi.Data.Models.Surveys
{
    public interface ISurveyRespondent
    {
        int Id { get; set; }

        string Name { get; set; } 


        SurveyRespondentGroup SurveyRespondentGroup { get; set; }


    }
}