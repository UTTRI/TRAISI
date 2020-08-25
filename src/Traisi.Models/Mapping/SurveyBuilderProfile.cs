using System.Collections.Generic;
using AutoMapper;
using Traisi.Models.ViewModels;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Models.Extensions;
using Newtonsoft.Json;
using System;
using Traisi.ViewModels.SurveyBuilder;

namespace Traisi.Models.Mapping
{
    public class SurveyBuilderProfile : Profile
    {
        public SurveyBuilderProfile()
        {

            CreateMap<SurveyLogicViewModel, SurveyLogic>()
            // .ForMember(s => s.QuestionId, opts => opts.MapFrom(o => int.Parse(o.Field)))
            .ForMember(s => s.Question, opts => opts.Ignore())
            .ForMember(s => s.ValidationMessages, opts => opts.MapFrom<LabelValueResolver, string>(x => x.Message))
            .ForMember(s => s.Id, opts => opts.MapFrom(o => o.Id))
            .ForMember(s => s.Value, opts => opts.MapFrom(o => o.Value))
            .ForMember(s => s.Expressions, opts => opts.MapFrom(o => o.Rules))
            .ForMember(s => s.Operator, opts => opts.MapFrom(o => o.Operator))
            .AfterMap((view, logic, ctx) =>
            {
                if (view.Field == null || view.Field.Length < 2)
                {
                    return;
                }
                logic.QuestionId = int.Parse(view.Field.Split('.')[0]);
                logic.LogicType = Enum.Parse<SurveyLogicType>(view.Field.Split('.')[1], true);
                return;
            });

            CreateMap<SurveyLogic, SurveyLogicRulesModel>()
            //.ForMember(s => s.Field, opts => opts.MapFrom(o => (o.QuestionId)))
            .ForMember(s => s.Operator, opts => opts.MapFrom(o => o.Operator))
            .ForMember(s => s.Message, opts => opts.MapFrom<LabelToStringValueResolver, LabelCollection<Label>>(x => x.ValidationMessages))
            .ForMember(s => s.Value, opts => opts.MapFrom(o => o.Value))
            .ForMember(s => s.Rules, opts => opts.ConvertUsing<RuleValueConverter2, List<SurveyLogic>>(x => x.Expressions))
            .AfterMap((logic, view, ctx) =>
            {
                view.Field = logic.QuestionId + "." + logic.LogicType.ToString().ToLower();
            })
            .IncludeAllDerived();

            

            CreateMap<SurveyLogic, SurveyLogicRuleViewModel>()
            .ForMember(s => s.Operator, opts => opts.MapFrom(o => o.Operator))
            .ForMember(s => s.Value, opts => opts.ConvertUsing<LogicValueConverter, string>())
             .AfterMap((logic, view, ctx) =>
            {
                view.Field = logic.QuestionId + "." + logic.LogicType.ToString().ToLower();
                view.Entity = logic.LogicType.ToString().ToLower();
            })
            .IncludeAllDerived();

            CreateMap<SurveyLogic, SurveyLogicBaseViewModel>()
            .ConvertUsing<LogicRuleConverter>();

            CreateMap<string, SurveyLogicOperator>()
            .ConvertUsing<SurveyLogicOperatorTypeConverter>();

            CreateMap<object, SurveyLogic>()
            .ForAllMembers(o => o.Ignore());


            CreateMap<SurveyLogic, GeneratedIdsViewModel>()
                      .ForMember(s => s.Id, opts => opts.MapFrom(o => o.Id))
                      .ForMember(s => s.Children, opts => opts.MapFrom(o => o.Expressions));
        }
    }

    public class RuleValueConverter : IValueConverter<List<SurveyLogic>, List<SurveyLogicBaseViewModel>>
    {
        public List<SurveyLogicBaseViewModel> Convert(List<SurveyLogic> sourceMember, ResolutionContext context)
        {
            List<SurveyLogicBaseViewModel> result = new List<SurveyLogicBaseViewModel>();
            foreach (var logic in sourceMember)
            {
                result.Add(context.Mapper.Map<SurveyLogicBaseViewModel>(logic));
            }
            return result;
        }
    }

    public class RuleValueConverter2 : IValueConverter<List<SurveyLogic>, List<SurveyLogicBaseViewModel>>
    {
        public List<SurveyLogicBaseViewModel> Convert(List<SurveyLogic> sourceMember, ResolutionContext context)
        {
            List<SurveyLogicBaseViewModel> result = new List<SurveyLogicBaseViewModel>();
            foreach (var logic in sourceMember)
            {

                if (logic.Condition != null)
                {
                    result.Add(context.Mapper.Map<SurveyLogicRulesModel>(logic));
                }
                else
                {
                    result.Add(context.Mapper.Map<SurveyLogicRuleViewModel>(logic));
                }
            }
            return result;
        }
    }


    public class LogicValueConverter : IValueConverter<string, object>
    {
        public object Convert(string sourceMember, ResolutionContext context)
        {
            if (sourceMember != null)
            {
                try
                {
                    var stringResult = JsonConvert.DeserializeObject<List<string>>(sourceMember);
                    if (stringResult != null)
                    {
                        return stringResult;
                    }
                }
                catch (Exception)
                {

                }
                if (int.TryParse(sourceMember, out var intValue))
                {
                    return intValue;
                }
            }

            return sourceMember;
        }
    }

    /// <summary>
    /// 
    /// </summary>
    public class SurveyLogicOperatorTypeConverter : ITypeConverter<string, SurveyLogicOperator>
    {
        public SurveyLogicOperator Convert(string source, SurveyLogicOperator destination, ResolutionContext context)
        {
            string sourceTransform = source.ToLowerInvariant();
            switch (sourceTransform)
            {
                case ">":
                    return SurveyLogicOperator.GreaterThan;
                case ">=":
                    return SurveyLogicOperator.GreaterThanEqualTo;
                case "<":
                    return SurveyLogicOperator.LessThan;
                case "<=":
                    return SurveyLogicOperator.LessThanEqualTo;
                case "=":
                    return SurveyLogicOperator.Equals;
                case "contains":
                    return SurveyLogicOperator.Contains;
                case "like":
                    return SurveyLogicOperator.Like;
                case "!=":
                    return SurveyLogicOperator.NotEquals;
                case "any of":
                    return SurveyLogicOperator.AnyOf;
                case "all of":
                    return SurveyLogicOperator.AllOf;
                case "none of":
                    return SurveyLogicOperator.NoneOf;
                default:
                    return SurveyLogicOperator.Equals;
            }
        }
    }


    /// <summary>
    /// 
    /// </summary>
    public class LogicRuleConverter : ITypeConverter<SurveyLogic, SurveyLogicBaseViewModel>
    {
        public SurveyLogicBaseViewModel Convert(SurveyLogic source, SurveyLogicBaseViewModel destination, ResolutionContext context)
        {

            if (source.QuestionId > 0 && source.Condition == null)
            {
                return context.Mapper.Map<SurveyLogicRuleViewModel>(source);
            }
            else
            {
                return context.Mapper.Map<SurveyLogicRulesModel>(source);
            }
        }
    }

}