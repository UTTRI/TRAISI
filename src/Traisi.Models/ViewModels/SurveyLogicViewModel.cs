using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json.Converters;
using Traisi.Data.Models.Surveys;

namespace Traisi.Models.ViewModels
{

    public class SurveyLogicBaseViewModel
    {

    }

    public class SurveyLogicViewModel : SurveyLogicBaseViewModel
    {
        public int? Id { get; set; } = 0;

        public string Message { get; set; }

        public string Condition { get; set; }

        public List<SurveyLogicViewModel> Rules { get; set; }

        public string Field { get; set; }

        public string Operator { get; set; }

        public object Value { get; set; }

        public int? ParentId { get; set; }

        public int? RootId { get; set; }

        public string Entity { get; set; } = "value";

        public int? ValidationQuestionId { get; set; }
    }

    public class SurveyLogicRulesModel : SurveyLogicBaseViewModel
    {
        public int? Id { get; set; } = 0;

        public string Message { get; set; }

        public string Condition { get; set; }

        public List<SurveyLogicBaseViewModel> Rules { get; set; }

        public string Field { get; set; }

        public string Operator { get; set; }

        public object Value { get; set; }

        public int? ParentId { get; set; }

        public int? RootId { get; set; }

        public string Entity { get; set; } = "value";

        public int? ValidationQuestionId { get; set; }
    }

    public class SurveyLogicRuleViewModel : SurveyLogicBaseViewModel
    {
        public int? Id { get; set; } = 0;

        public SurveyLogicOperator Operator { get; set; }
        public string Field { get; set; }

        public object Value { get; set; }

        public int? ParentId { get; set; }

        public int? RootId { get; set; }

        public string Entity { get; set; } = "value";
    }

    public class SurveyViewerLogicRulesViewModel : SurveyLogicBaseViewModel
    {
        public string Condition { get; set; }

        public List<SurveyLogicBaseViewModel> Rules { get; set; }

    }

    public class SurveyViewerLogicRuleViewModel : SurveyLogicBaseViewModel
    {
        public SurveyLogicOperator Operator { get; set; }
        public int SourceQuestionId { get; set; }
        public object Value { get; set; }

    }


}