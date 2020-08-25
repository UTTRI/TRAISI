using System.Collections.Generic;

namespace Traisi.Sdk.Library.ResponseTypes
{
    public interface IOptionListResponse : IResponseType
    {
        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        ICollection<IResponseType> OptionValues { get; set; }
    }
}