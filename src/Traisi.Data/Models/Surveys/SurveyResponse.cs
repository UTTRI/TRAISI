using System.Collections.Generic;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.Surveys
{
    public class SurveyResponse : AuditableEntity, ISurveyResponse, IResponseType
    {
        public int Id { get; set; }

        public QuestionPart QuestionPart { get; set; }

        public List<ResponseValue> ResponseValues { get; set; }

        public int Repeat { get; set; }

        public SurveyRespondent Respondent { get; set; }

        public SurveyAccessRecord SurveyAccessRecord { get; set; }

        /// <summary>
        /// if a response is excluded, it is not visible to response queries relevent
        /// to survey session. They will be kept for analysis. A response is excluded when
        /// it was originally responded to, but hidden from later changes in the survey.
        /// </summary>
        /// <value></value>
        public bool Excluded { get; set; }

        public SurveyResponse()
        {
            this.ResponseValues = new List<ResponseValue>();
        }


    }
}