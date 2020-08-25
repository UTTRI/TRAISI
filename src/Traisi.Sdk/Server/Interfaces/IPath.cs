using System.Collections.Generic;
using Traisi.Sdk.Enums;
namespace Traisi.Sdk.Interfaces
{
    public interface IPath
    {

        List<IPoint> Points { get; set; }
    }
}