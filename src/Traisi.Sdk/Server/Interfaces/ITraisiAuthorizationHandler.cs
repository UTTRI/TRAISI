
using Microsoft.AspNetCore.Http;

namespace Traisi.Sdk.Interfaces
{
    public interface ITraisiIAuthorizationHandler
    {

        bool ShouldAuthorize(HttpContext s);
    }
}