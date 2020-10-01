using System.Collections.Concurrent;
using System.Collections.Generic;
using Traisi.Data.Models.ResponseTypes;
using Newtonsoft.Json.Linq;
using System;
using Traisi.Sdk.Library.ResponseTypes;
using Traisi.Sdk.Interfaces;

namespace Traisi.ViewModels.SurveyViewer
{
    public class TimelineResponseViewModel : SurveyResponseViewModel
    {
        public new List<TimelineResponseValueViewModel> ResponseValues { get; set; }

    }

    public class TimelineResponseValueViewModel
    {
        public Address Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTimeOffset TimeA { get; set; }
        public DateTimeOffset TimeB { get; set; }
        public string Name { get; set; }
        public string Purpose { get; set; }
        public int Order { get; set; }

        public string Mode {get;set;}
    }
}