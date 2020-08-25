using System.Collections.Generic;

namespace Traisi.Sdk.Interfaces
{
    public interface IEndpointCallable
    {
        ICollection<QuestionEndpoint> QuestionEndpoints { get; set; }
    }
}