using System;
using System.Collections.Generic;
using Traisi.Data.Models.Interfaces;

namespace Traisi.Data.Models.Surveys
{
    public interface ISurveyAccessRecord
    {
        int Id { get; set; }
        Dictionary<string,string> QueryParams { get; set; }

        DateTimeOffset AccessDateTime { get; set; }
        string UserAgent { get; set; }

        ApplicationUser AccessUser { get; set; }
    }
}