using System.ComponentModel.DataAnnotations;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    public abstract class ResponseValue : IResponseType
    {
        [Key]
        public int Id { get; set; }
        public SurveyResponse SurveyResponse { get; set; }

    }
}