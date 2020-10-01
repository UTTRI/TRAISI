using System;
using Traisi.Sdk.Interfaces;

namespace Traisi.ViewModels.SurveyViewer
{
    public class SurveyRespondentViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Relationship { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        public Address HomeAddress { get; set; }

        public double HomeLatitude { get; set; }

        public double HomeLongitude { get; set; }

        public DateTimeOffset SurveyAccessTime { get; set; }
    }
}