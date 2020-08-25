using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.Questions;
using Traisi.Data.Core;
using Newtonsoft.Json;

namespace Traisi.Data.Models.Questions
{
    /// <summary>
    /// Conditional data for a question
    /// </summary>
    public class QuestionOptionConditional
    {
        [JsonIgnore]
        public int Id { get; set; }
        public QuestionOption TargetOption { get; set; }

        [JsonIgnore]
        [ForeignKey("TargetOption")]
        public int TargetOptionId { get; set; }
        
        public QuestionPart SourceQuestion { get; set; }

        [JsonIgnore]
        [ForeignKey("SourceQuestion")]
        public int SourceQuestionId { get; set; }

        public QuestionConditionalType Condition { get; set; }
        public string Value { get; set; }

    }

}