using System;
using System.Runtime.Serialization;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Library.ResponseTypes;
namespace Traisi.Data.Models.ResponseTypes
{
    public enum ResponseTypes
    {
        StringResponse = 1,
        NumberResponse = 2,
        LocationResponse = 3,
        OptionListResponse = 4,
        JsonResponse = 5,
        TimelineResponse = 6,
        DateTimeResponse = 7,
        OptionSelectResponse = 8,


    }
}