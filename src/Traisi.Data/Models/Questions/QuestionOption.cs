using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Core;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Models.Questions
{
    public class QuestionOption : IQuestionOption, IEntity
    {
        [JsonIgnore]
        public int Id { get; set; }

        public string Name { get; set; }

		public string Code { get; set; }

        public LabelCollection<Label> QuestionOptionLabels { get; set; }

        public int Order { get; set; }

        public ICollection<QuestionOptionConditional> QuestionOptionConditionalsTarget { get; set; }

        public QuestionPart QuestionPartParent { get; set; }

        [JsonIgnore]
        [ForeignKey("QuestionPartParent")]
        public int QuestionPartParentId { get; set; }

        public QuestionOption()
        {
            QuestionOptionLabels = new LabelCollection<Label>();
        }

    }
}