using System;
using System.Runtime.Serialization;

namespace Traisi.Data.Core
{
    public enum Gender
    {
        None,
        Female,
        Male
    }

    public enum SurveyViewType {
        RespondentView = 0,
        CatiView = 1
    }

    public enum QuestionConditionalType
    {
        [EnumMember(Value = "Is Equal To")]
        IsEqualTo = 0,
        [EnumMember(Value = "Is Not Equal To")]
        IsNotEqualTo = 1,
        [EnumMember(Value = "Greater Than")]
        GreaterThan,
        [EnumMember(Value = "Less Than")]
        LessThan = 3,
        [EnumMember(Value = "In Bounds")]
        InBounds = 4,
        [EnumMember(Value = "Out Of Bounds")]
		OutOfBounds = 5,
        [EnumMember(Value = "In Range")]
		InRange = 6,
        [EnumMember(Value = "Outside Range")]
		OutsideRange = 7,
        [EnumMember(Value = "Is Any Of")]
        IsAnyOf = 8,
        [EnumMember(Value = "Is All Of")]
        IsAllOf = 9,
        [EnumMember(Value = "Contains")]
        Contains = 10,
        [EnumMember(Value = "Does Not Contain")]
        DoesNotContain = 11
    }

}
