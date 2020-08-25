using System.Collections.Generic;
using System.Linq;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Models.Extensions
{
    /// <summary>
    /// Utility class for containing label collections.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class LabelCollection<T> : HashSet<T> where T : Label, new()
    {
        public LabelCollection()
        {

        }

        public LabelCollection(T item) : base()
        {
            this[item.Language] = item;
        }
        public T this[string key]
        {
            get
            {
                var res = this.FirstOrDefault(t => t.Language == key);
                if (res == null)
                {
                    res = new T()
                    {
                        Language = key
                    };
                    Add(res);
                }
                return res;
            }
            set
            {
                value.Language = key;
                RemoveWhere(t => t.Language == key);
                Add(value);
            }
        }

        /// <summary>
        /// Returns the default (or first) label in the collection. 
        /// </summary>
        /// <value>The label for the default language (usually first label).
        /// Returns null if no labels are in the collection.</value>
        public T Default
        {
            get
            {
                return this.FirstOrDefault();
            }
        }

    }
}