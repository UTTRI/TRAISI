using System.Collections.Generic;
using NetTopologySuite.Geometries;

namespace Traisi.Sdk.Interfaces
{
    public interface ISurveyRespondent
    {
        int Id { get; set; }

        string Name { get; set; }

        Point HomeLocation { get; set; }

        Address HomeAddress { get; set; }
    }

    public class Address
    {
        public string PostalCode { get; set; }

        public string StreetAddress { get; set; }

        public int StreetNumber { get; set; }

        public string City { get; set; }

        public string Province { get; set; }

        public string FormattedAddress { get; set; }

        public string Id { get; set; }
    }
}