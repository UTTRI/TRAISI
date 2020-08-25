using Traisi.Data.Models.Interfaces;

namespace Traisi.Data.Models.Surveys
{
    public interface ILabel
    {
        string Value { get; set; }

        string Language { get; set; }
    }
}