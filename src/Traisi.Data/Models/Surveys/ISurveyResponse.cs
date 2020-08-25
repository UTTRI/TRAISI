using System.Collections.Generic;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.ResponseTypes;

namespace Traisi.Data.Models.Surveys
{
    public interface ISurveyResponse
    {
        int Id { get; set; }

        int Repeat { get; set; }

        QuestionPart QuestionPart { get; set; }

        List<ResponseValue> ResponseValues { get; set; }

        SurveyRespondent Respondent { get; set; }
    }
}