using System.Collections.Generic;
using AutoMapper;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Surveys;

namespace Traisi.Models.Mapping
{
    /// <summary>
    /// Maps some source string value (with language) into the Label collection on the destination
    /// object.static This will create a new label if the label for that language does not exist.
    /// </summary>
    public class LabelValueResolver : IMemberValueResolver<object, object, string, LabelCollection<Label>>
    {
        public LabelCollection<Label> Resolve(object source, object destination, string sourceMember, LabelCollection<Label> destMember, ResolutionContext context)
        {
            destMember[context.Items["Language"] as string].Value = sourceMember;
            return destMember;
        }
    }

    public class LabelToStringValueResolver : IMemberValueResolver<object, object, LabelCollection<Label>, string>
    {
        public string Resolve(object source, object destination, LabelCollection<Label> sourceMember, string destMember, ResolutionContext context)
        {
            var res = sourceMember[context.Items["Language"] as string].Value;
            return res;
        }
    }

}