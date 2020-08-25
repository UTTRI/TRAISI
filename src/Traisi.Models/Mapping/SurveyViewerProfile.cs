using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Newtonsoft.Json.Linq;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Models.Surveys.Validation;
using Traisi.Models.ViewModels;
using Traisi.Sdk.Enums;
using Traisi.ViewModels;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.Models.Mapping
{
    public class SurveyViewerProfile : Profile
    {
        public SurveyViewerProfile()
        {
            CreateMap<SurveyView, SurveyViewTermsAndConditionsViewModel>()
                .AfterMap((s, svm, opt) =>
                {
                    if (
                        s
                            .TermsAndConditionsLabels[opt.Items["Language"] as
                            string] !=
                        null
                    )
                    {
                        svm.TermsAndConditionsText =
                            s
                                .TermsAndConditionsLabels[opt
                                    .Items["Language"] as
                                string]
                                .Value;
                    }
                    else
                    {
                        svm.TermsAndConditionsText =
                            s.TermsAndConditionsLabels.Default?.Value;
                    }
                });

            CreateMap<SurveyView, SurveyViewScreeningQuestionsViewModel>()
                .AfterMap((s, svm, opt) =>
                {
                    svm.ScreeningQuestions =
                        s
                            .ScreeningQuestionLabels
                            .Select(x => new string(x.Value))
                            .ToList();
                });

            CreateMap<SurveyView, SurveyViewThankYouViewModel>()
                .AfterMap((s, svm, opt) =>
                {
                    if (
                        s.ThankYouPageLabels[opt.Items["Language"] as string] !=
                        null
                    )
                    {
                        svm.ThankYouText =
                            s
                                .ThankYouPageLabels[opt.Items["Language"] as
                                string]
                                .Value;
                    }
                    else
                    {
                        svm.ThankYouText =
                            s.TermsAndConditionsLabels.Default?.Value;
                    }
                    if (string.IsNullOrWhiteSpace(s.Survey.SuccessLink))
                    {
                        svm.HasSuccessLink = false;
                    }
                    else
                    {
                        svm.HasSuccessLink = true;
                        svm.SuccessLink = s.Survey.SuccessLink;
                    }
                });

            CreateMap<Survey, SurveyStartViewModel>()
                .ForMember(m => m.HasGroupCodes,
                options =>
                {
                    options.Ignore();
                })
                .ForMember(m => m.Name, opts => opts.MapFrom(o => o.Name))
                .ForMember(m => m.SurveyViews, opts => opts.Ignore())
                .AfterMap((s, svm, opt) =>
                {
                    var view =
                        s.SurveyViews.Find(x => x.ViewName == "Standard");
                    if (view != null)
                    {
                        svm.WelcomeText =
                            view
                                .WelcomePageLabels[opt.Items["Language"] as
                                string]
                                .Value;
                    }
                    else
                    {
                        svm.WelcomeText = view.WelcomePageLabels.Default?.Value;
                    }
                    svm.HasGroupCodes = s.HasGroupCodes;
                })
                .AfterMap((s, svm, opt) =>
                {
                    var view = s.SurveyViews.FirstOrDefault();
                    if (view != null)
                    {
                        svm.TitleText =
                            view
                                .Survey
                                .TitleLabels[opt.Items["Language"] as string]
                                .Value;
                    }
                    else
                    {
                        svm.TitleText = view.Survey.TitleLabels.Default?.Value;
                    }
                });

            CreateMap<SurveyView, SurveyViewerViewModel>()
                .ForMember(vm => vm.Questions,
                map => map.MapFrom(v => v.QuestionPartViews))
                .AfterMap((s, svm, opt) =>
                {
                    svm.TitleText =
                        s
                            .Survey
                            .TitleLabels[opt.Items["Language"] as string]
                            .Value;
                })
                .AfterMap((s, svm, opt) =>
                {
                    svm.SurveyCompletionText =
                        s
                            .ThankYouPageLabels[opt.Items["Language"] as string]
                            .Value;
                })
                .AfterMap((s, svm, opt) =>
                {
                    svm.TermsAndConditionsText =
                        s
                            .TermsAndConditionsLabels[opt.Items["Language"] as
                            string]
                            .Value;
                })
                .AfterMap((s, svm, opt) =>
                {
                    svm.WelcomeText =
                        s
                            .WelcomePageLabels[opt.Items["Language"] as string]
                            .Value;
                });

            CreateMap<QuestionPartView, SurveyViewPageViewModel>()
                .ForMember(m => m.Sections,
                map =>
                {
                    map
                        .MapFrom(v =>
                            v
                                .QuestionPartViewChildren
                                .Where(q => q.QuestionPart == null));
                })
                .ForMember(m => m.Questions,
                map =>
                    map
                        .MapFrom(v =>
                            v
                                .QuestionPartViewChildren
                                .Where(q => q.QuestionPart != null)))
                .AfterMap((s, svm, opt) =>
                {
                    svm.Label = s.Labels[opt.Items["Language"] as string].Value;
                });

            CreateMap<QuestionPartView, SurveyViewSectionViewModel>()
                .ForMember(m => m.Questions,
                map => map.MapFrom(v => v.QuestionPartViewChildren))
                .ForMember(m => m.RepeatSource,
                map =>
                {
                    map.MapFrom(f => f.RepeatSource.Id);
                    map.Condition(f => f.RepeatSource != null);
                })
                .AfterMap((s, svm, opt) =>
                {
                    if (s.RepeatSource != null)
                    {
                        svm.IsRepeat = true;
                    }
                })
                .AfterMap((s, svm, opt) =>
                {
                    svm.Label = s.Labels[opt.Items["Language"] as string].Value;
                });

            CreateMap<QuestionConditional, SurveyViewConditionalViewModel>()
                .ForMember(m => m.ConditionalType,
                map => map.MapFrom(v => v.Condition));

            CreateMap<SurveyLogic, SurveyViewerLogicRulesViewModel>()
                .//.ForMember(s => s.Field, opts => opts.MapFrom(o => (o.QuestionId)))
                ForMember(s => s.Rules,
                opts =>
                    opts
                        .ConvertUsing
                        <SurveyViewerLogicRuleValueConverter, List<SurveyLogic>
                        >(x => x.Expressions))
                .IncludeAllDerived();

            CreateMap<SurveyLogic, SurveyViewerLogicRuleViewModel>()
                .ForMember(s => s.SourceQuestionId,
                opts => opts.MapFrom(o => (o.QuestionId)))
                .ForMember(s => s.Operator,
                opts => opts.MapFrom(x => x.Operator))
                .ForMember(s => s.Value,
                opts =>
                    opts
                        .ConvertUsing<StringToJsonValueConverter, string>(x =>
                            x.Value))
                .IncludeAllDerived();

            CreateMap<QuestionPartView, QuestionViewModel>()
                .ForMember(m => m.QuestionType,
                map => map.MapFrom(v => v.QuestionPart.QuestionType))
                .ForMember(m => m.IsOptional,
                map => map.MapFrom(v => v.IsOptional))
                .ForMember(m => m.Order, map => map.MapFrom(v => v.Order))
                .ForMember(m => m.Label, map => map.Ignore())
                .ForMember(m => m.DescriptionLabel, map => map.Ignore())
                .ForMember(m => m.Name,
                map => map.MapFrom(v => v.QuestionPart.Name))
                .ForMember(m => m.IsHousehold,
                map => map.MapFrom(f => f.IsHousehold))
                .ForMember(m => m.Conditionals,
                map => map.MapFrom(f => f.QuestionPart.Conditionals))
                .ForMember(m => m.RepeatSource,
                map =>
                {
                    map.MapFrom(f => f.RepeatSource.Id);
                    map.Condition(f => f.RepeatSource != null);
                })
                .AfterMap((s, svm, opt) =>
                {
                    try
                    {
                        svm.Label =
                            s.Labels[opt.Items["Language"] as string].Value;
                        svm.DescriptionLabel =
                            s
                                .DescriptionLabels[opt.Items["Language"] as
                                string]
                                .Value;
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                })
                .AfterMap((s, svm, opt) =>
                {
                    if (s.RepeatSource != null)
                    {
                        svm.IsRepeat = true;
                    }
                })
                .AfterMap((s, svm, opt) =>
                {
                    if (s.QuestionPart != null)
                    {
                        svm.QuestionId = s.QuestionPart.Id;
                    }
                })
                .AfterMap((s, svm, opt) =>
                {
                    if (
                        s.QuestionPart != null &&
                        s.QuestionPart.QuestionConfigurations.Count > 0
                    )
                    {
                        svm.Configuration =
                            new ConcurrentDictionary<string, object>();
                        s
                            .QuestionPart
                            .QuestionConfigurations
                            .AsParallel()
                            .ForAll(a =>
                            {
                                switch (a.ValueType)
                                {
                                    case ConfigurationValueType.Integer:
                                        svm
                                            .Configuration[ResponseValueResolver
                                                .NamesContractResolver
                                                .GetResolvedPropertyName(a.Name)
                                                .Replace(" ", "")] =
                                            int.Parse(a.Value);
                                        break;
                                    case ConfigurationValueType.Decimal:
                                        svm
                                            .Configuration[ResponseValueResolver
                                                .NamesContractResolver
                                                .GetResolvedPropertyName(a.Name)
                                                .Replace(" ", "")] =
                                            double.Parse(a.Value);
                                        break;
                                    case ConfigurationValueType.Custom:
                                        try
                                        {
                                            svm
                                                .Configuration[ResponseValueResolver
                                                    .NamesContractResolver
                                                    .GetResolvedPropertyName(a
                                                        .Name)
                                                    .Replace(" ", "")] =
                                                JToken.Parse(a.Value);
                                        }
                                        catch (Exception)
                                        {
                                            svm
                                                .Configuration[ResponseValueResolver
                                                    .NamesContractResolver
                                                    .GetResolvedPropertyName(a
                                                        .Name)
                                                    .Replace(" ", "")] =
                                                a.Value;
                                        }
                                        break;
                                    case ConfigurationValueType.Response:
                                        try
                                        {
                                            svm
                                                .Configuration[ResponseValueResolver
                                                    .NamesContractResolver
                                                    .GetResolvedPropertyName(a
                                                        .Name)
                                                    .Replace(" ", "")] =
                                                JToken.Parse(a.Value);
                                        }
                                        catch (Exception)
                                        {
                                            svm
                                                .Configuration[ResponseValueResolver
                                                    .NamesContractResolver
                                                    .GetResolvedPropertyName(a
                                                        .Name)
                                                    .Replace(" ", "")] =
                                                a.Value;
                                        }
                                        break;
                                    default:
                                        svm
                                            .Configuration[ResponseValueResolver
                                                .NamesContractResolver
                                                .GetResolvedPropertyName(a.Name)
                                                .Replace(" ", "")] = a.Value;
                                        break;
                                }
                            });
                    }
                });

            CreateMap<QuestionOption, QuestionOptionViewModel>()
                .ForMember(o => o.Id, map => map.MapFrom(v => v.Id))
                .ForMember(o => o.Name, map => map.MapFrom(v => v.Name))
                .ForMember(o => o.Order, map => map.MapFrom(v => v.Order))
                .ForMember(o => o.Label, map => map.Ignore())
                .AfterMap((s, svm, opt) =>
                {
                    try
                    {
                        svm.Label =
                            s
                                .QuestionOptionLabels[opt.Items["Language"] as
                                string]
                                .Value;
                    }
                    catch (Exception)
                    {

                    }
                });

            CreateMap<LabelCollection<Label>, string>()
                .ConvertUsing((error, dst, context) =>
                {
                    return error[context.Items["Language"] as string].Value;
                });

            CreateMap<SurveyValidationError, ValidationStateViewModel>()
                .ForMember(m => m.RelatedQuestions,
                map => map.MapFrom(x => x.RelatedQuestions))
                .AfterMap((s, svm, opt) =>
                {
                    try
                    {
                        svm.ErrorMessages =
                            new List<string>(new[]
                                {
                                    s
                                        .Messages[opt.Items["Language"] as
                                        string]
                                        .Value
                                });
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                });
            CreateMap
            <SurveyResponseValidationState, SurveyViewerValidationStateViewModel
            >()
                .ForMember(x => x.SurveyLogicValidationState,
                map => map.MapFrom(y => y.SurveyLogicError));
        }
    }

    public class StringToJsonValueConverter : IValueConverter<string, object>
    {
        public object Convert(string sourceMember, ResolutionContext context)
        {
            return JToken.Parse(sourceMember);
        }
    }

    public class
    SurveyViewerLogicRuleValueConverter
    : IValueConverter<List<SurveyLogic>, List<SurveyLogicBaseViewModel>>
    {
        public List<SurveyLogicBaseViewModel>
        Convert(List<SurveyLogic> sourceMember, ResolutionContext context)
        {
            List<SurveyLogicBaseViewModel> result =
                new List<SurveyLogicBaseViewModel>();
            foreach (var logic in sourceMember)
            {
                if (logic.Condition != null)
                {
                    result
                        .Add(context
                            .Mapper
                            .Map<SurveyViewerLogicRulesViewModel>(logic));
                }
                else
                {
                    result
                        .Add(context
                            .Mapper
                            .Map<SurveyViewerLogicRuleViewModel>(logic));
                }
            }
            return result;
        }
    }
}
