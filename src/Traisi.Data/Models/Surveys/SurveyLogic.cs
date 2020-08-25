using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Models.Questions;

namespace Traisi.Data.Models.Surveys
{
    /// <summary>
    /// Label items, store most alterable and dynamic text fields.
    /// </summary>
    public class SurveyLogic
    {
        [JsonIgnore]
        public int Id { get; set; }
        public SurveyLogicCondition? Condition { get; set; }
        public List<SurveyLogic> Expressions { get; set; }
        public LabelCollection<Label> ValidationMessages { get; set; }
        public string Value { get; set; }
        public QuestionPart Question { get; set; }

        [ForeignKey("ValidationQuestion")]
        public int? ValidationQuestionId { get; set; }
        public QuestionPart ValidationQuestion { get; set; }


        [ForeignKey("Parent")]
        public int? ParentId { get; set; }
        public SurveyLogic Parent { get; set; }

        [JsonIgnore]
        [ForeignKey("Root")]
        public int? RootId { get; set; }
        public SurveyLogic Root { get; set; }

        [JsonIgnore]
        [ForeignKey("Question")]
        public int? QuestionId { get; set; }
        public SurveyLogicOperator? Operator { get; set; }

        public SurveyLogicType? LogicType { get; set; }

        public SurveyLogic()
        {
            ValidationMessages = new LabelCollection<Label>();
            Expressions = new List<SurveyLogic>();
        }
    }

    public enum SurveyLogicOperator
    {
        [EnumMember(Value = "=")]
        Equals,
        [EnumMember(Value = "!=")]
        NotEquals,
        [EnumMember(Value = ">")]
        GreaterThan,
        [EnumMember(Value = ">=")]
        GreaterThanEqualTo,
        [EnumMember(Value = "<")]
        LessThan,
        [EnumMember(Value = "<=")]
        LessThanEqualTo,
        [EnumMember(Value = "contains")]
        Contains,
        [EnumMember(Value = "like")]
        Like,
        [EnumMember(Value = "any of")]
        AnyOf,
        [EnumMember(Value = "all of")]
        AllOf,
        [EnumMember(Value = "none of")]
        NoneOf
    }

    public enum SurveyLogicCondition
    {
        [EnumMember(Value = "and")]
        And,
        [EnumMember(Value = "or")]
        Or
    }

    public enum SurveyLogicType
    {
        [EnumMember(Value = "response")]
        Response,
        [EnumMember(Value = "value")]
        Value
    }
}