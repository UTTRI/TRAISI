
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.Extensions;

namespace Traisi.Data.Models.Surveys
{
    public interface ISurvey
    {

        int Id { get; set; }
        string Code { get; set; }
        string Owner { get; set; }
        string Group { get; set; }
        DateTime StartAt { get; set; }
        DateTime EndAt { get; set; }
        bool IsActive { get; set; }
        bool IsOpen { get; set; }
        string SuccessLink { get; set; }
        string RejectionLink { get; set; }
        string DefaultLanguage { get; set; }
        string StyleTemplate { get; set; }


        SurveyViewCollection<SurveyView> SurveyViews { get; set; }

        string Name { get; set; }
    }
}