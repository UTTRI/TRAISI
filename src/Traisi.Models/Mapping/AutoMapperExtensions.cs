using System.Collections.Generic;
using AutoMapper;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Models.Questions;

namespace Traisi.ViewModels.Extensions
{

    public static class AutoMapperExtensions
    {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="source"></param>
        /// <typeparam name="TDest"></typeparam>
        /// <returns></returns>
        public static TDest ToLocalizedModel<TDest>(this IEntity source, IMapper mapper, string language)
        {
            return mapper.Map<TDest>(source, opts =>
              opts.Items["Language"] = language);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="source"></param>
        /// <param name="language"></param>
        /// <typeparam name="TDest"></typeparam>
        /// <returns></returns>
        public static TDest ToLocalizedModel<TDest, T>(this ICollection<T> source,  IMapper mapper, string language) where T : IEntity
        {
            return mapper.Map<TDest>(source, opts =>
                 opts.Items["Language"] = language);
        }

    }
}