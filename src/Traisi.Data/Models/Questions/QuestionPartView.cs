using System.Collections.Generic;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Models.Extensions;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traisi.Data.Models.Questions
{
    /// <summary>
    /// QuestionPartView model - container of QuestionParts 
    /// </summary>
    public class QuestionPartView : IQuestionPartView, IEntity
    {
        /// <summary>
        /// Id
        /// </summary>
        /// <value></value>
        [JsonIgnore]
        public int Id { get; set; }

        /// <summary>
        /// Collection of Label objects for this view.
        /// </summary>
        /// <value></value>
        public LabelCollection<Label> Labels { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public LabelCollection<Label> DescriptionLabels { get; set; }

        /// <summary>
        /// The associated QuestionPart for this QuestionPartView
        /// </summary>
        /// <value></value>
        public QuestionPart QuestionPart { get; set; }

        public QuestionPartView ParentView { get; set; }

        [JsonIgnore]
        public int? ParentViewId { get; set; }

        /// <summary>
        /// The Survey View this question belongs to.
        /// </summary>
        /// <value></value>
        public SurveyView SurveyView { get; set; }

        [JsonIgnore]
        [ForeignKey("SurveyView")]
        public int? SurveyViewId { get; set; }

        public List<QuestionPartView> QuestionPartViewChildren { get; set; }

        /// <summary>
        /// The order (position) of this question part view inside of its containing survey view.
        /// </summary>
        /// <value></value>
        public int Order { get; set; }

        public bool IsOptional { get; set; }
        public bool IsHousehold { get; set; }

        public bool IsMultiView { get; set; }

        public bool IsDefaultHidden { get; set; }

        public QuestionPart RepeatSource { get; set; }

        public string Icon { get; set; }

        public QuestionPartView CATIDependent { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public QuestionPartView()
        {
            this.Labels = new LabelCollection<Label>();
            this.DescriptionLabels = new LabelCollection<Label>();
            this.QuestionPartViewChildren = new List<QuestionPartView>();
        }
    }
}