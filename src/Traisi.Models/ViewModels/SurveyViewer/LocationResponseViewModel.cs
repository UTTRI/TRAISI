using System.Collections.Concurrent;
using System.Collections.Generic;
using Traisi.Data.Models.ResponseTypes;
using Newtonsoft.Json.Linq;
using Traisi.Sdk.Library.ResponseTypes;
using Traisi.Sdk.Interfaces;

namespace Traisi.ViewModels.SurveyViewer
{
    public class LocationResponseViewModel : SurveyResponseViewModel
    {
        public new List<LocationResponseValueViewModel> ResponseValues { get; set; }
    }

    public class LocationResponseValueViewModel
    {
        public Address Address { get; set; }
        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}