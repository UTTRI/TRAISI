using System;
using Newtonsoft.Json;
using Traisi.Data.Models.Interfaces;

namespace Traisi.Data.Models.Surveys
{
    /// <summary>
    /// Label items, store most alterable and dynamic text fields.
    /// </summary>
    public class Label : ILabel
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Value { get; set; }
        public string Language { get; set; }

    }
}