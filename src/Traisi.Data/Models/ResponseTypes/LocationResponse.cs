using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using NetTopologySuite.Geometries;
using Traisi.Sdk.Library.ResponseTypes;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Sdk.Interfaces;

namespace Traisi.Data.Models.ResponseTypes
{
    public class LocationResponse : ResponseValue, ILocationResponse
    {
        [Column(TypeName = "geography")]
        public Point Location { get; set; }

        [Column(TypeName = "jsonb")]
        public Address Address { get; set; }
    }

    public class LocationLatLngResponse
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Address Address { get; set; }
    }


}