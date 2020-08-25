using System.Collections.Generic;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Models.Questions
{
    public interface IQuestionPartView
    {
        int Id { get; set; }

        LabelCollection<Label> Labels { get; set; }

        List<QuestionPartView> QuestionPartViewChildren { get; set; }

        QuestionPart QuestionPart { get; set; }

        QuestionPartView ParentView { get; set; }

        SurveyView SurveyView { get; set; }

		/// <summary>
		/// Flag for whether or not this view (Section normally) will render its child views on the same
		/// or separate pages in the survey viewer.
		/// </summary>
		/// <value></value>
		bool IsMultiView {get;set;}

        bool IsOptional { get; set; }
        bool IsHousehold { get; set; }
		QuestionPart RepeatSource { get; set; }

        string Icon { get; set; }

        int Order { get; set; }
    }
}