using Traisi.Sdk.Interfaces;

namespace Traisi.ViewModels.SurveyViewer
{
    public class MapLocation
    {

        public string Name { get; set; }
        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public Address Address { get; set; }
    }


}