using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using AutoMapper;
using Newtonsoft.Json.Serialization;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;
using Traisi.Sdk.Enums;
using Traisi.ViewModels.SurveyViewer;

namespace Traisi.Models.Mapping
{
    class SurveyRespondentProfile : Profile
    {
        public SurveyRespondentProfile()
        {
            CreateMap<SurveyResponse, SurveyResponseViewModel>()
                .ForMember(s => s.ResponseValues, r => r.MapFrom<ResponseValueResolver>())
                .ForMember(s => s.Configuration, r => r.MapFrom<SurveyResponseConfigurationValueResolver>())
                .ForMember(s => s.QuestionId, r => r.MapFrom(r2 => r2.QuestionPart.Id));

            CreateMap<SurveyRespondentGroup, SurveyRespondentGroupViewModel>();
            CreateMap<SurveyRespondent, SurveyRespondentViewModel>()
            .AfterMap((s, svm, opt) =>
                {
                    if (s.HomeLocation != null)
                    {
                        svm.HomeLatitude = s.HomeLocation.Y;
                        svm.HomeLongitude = s.HomeLocation.X;
                    }
                });


            CreateMap<SubRespondent, SurveyRespondentViewModel>();
            CreateMap<SurveyRespondentViewModel, SubRespondent>()
                .ForMember(m => m.SurveyRespondentGroup, c => c.Ignore());
            CreateMap<PrimaryRespondent, SurveyRespondentViewModel>()
                .ForMember(m => m.HomeLatitude, c => c.MapFrom(x => x.HomeLocation.Y))
                .ForMember(m => m.HomeLongitude, c => c.MapFrom(x => x.HomeLocation.X))
                .ForMember(m => m.SurveyAccessTime, c => c.MapFrom(x => x.SurveyAccessDateTime));
                
            CreateMap<SurveyResponse, LocationResponseViewModel>().ForMember(
                m => m.ResponseValues, r => r.MapFrom<LocationResponseValueResolver>()
            ).ForMember(s => s.Configuration, r => r.MapFrom<SurveyResponseConfigurationValueResolver>())
             .ForMember(s => s.QuestionId, r => r.MapFrom(r2 => r2.QuestionPart.Id));

            CreateMap<SurveyResponse, TimelineResponseViewModel>().ForMember(
                m => m.ResponseValues, r => r.MapFrom<TimelineResponseValueResolver>()
            ).ForMember(s => s.Configuration, r => r.MapFrom<SurveyResponseConfigurationValueResolver>())
             .ForMember(s => s.QuestionId, r => r.MapFrom(r2 => r2.QuestionPart.Id));
        }
    }

    public class TimelineResponseValueResolver : IValueResolver<SurveyResponse, TimelineResponseViewModel, List<TimelineResponseValueViewModel>>
    {
        public List<TimelineResponseValueViewModel> Resolve(SurveyResponse source, TimelineResponseViewModel destination, List<TimelineResponseValueViewModel> destMember, ResolutionContext context)
        {
            List<TimelineResponseValueViewModel> responseValues = new List<TimelineResponseValueViewModel>();
            foreach (var response in source.ResponseValues)
            {
                var locationResponse = response as TimelineResponse;

                responseValues.Add(new TimelineResponseValueViewModel()
                {
                    Address = locationResponse.Address,
                    Latitude = locationResponse.Location != null ? locationResponse.Location.Y : 0,
                    Longitude = locationResponse.Location != null ? locationResponse.Location.X : 0,
                    Name = locationResponse.Name,
                    Order = locationResponse.Order.GetValueOrDefault(),
                    Purpose = locationResponse.Purpose,
                    TimeA = locationResponse.TimeA,
                    TimeB = locationResponse.TimeB,
                    Mode = locationResponse.Mode,
                    Identifier = locationResponse.Identifier

                });
            }
            return responseValues;
        }
    }

    /// <summary>
    /// 
    /// </summary>
    public class SurveyResponseConfigurationValueResolver : IValueResolver<SurveyResponse, SurveyResponseViewModel, ConcurrentDictionary<string, object>>
    {
        public ConcurrentDictionary<string, object> Resolve(SurveyResponse source, SurveyResponseViewModel destination, ConcurrentDictionary<string, object> destMember, ResolutionContext context)
        {
            var configuration = new ConcurrentDictionary<string, object>();
            if (source.QuestionPart?.QuestionConfigurations?.Count > 0)
            {
                source.QuestionPart.QuestionConfigurations.AsParallel().ForAll(a =>
                {
                    switch (a.ValueType)
                    {
                        case ConfigurationValueType.Integer:
                            configuration[ResponseValueResolver.NamesContractResolver.GetResolvedPropertyName(a.Name).Replace(" ", "")] =
                            int.Parse(a.Value);
                            break;
                        case ConfigurationValueType.Decimal:
                            configuration[ResponseValueResolver.NamesContractResolver.GetResolvedPropertyName(a.Name).Replace(" ", "")] =
                            double.Parse(a.Value);
                            break;
                        case ConfigurationValueType.Custom:
                            configuration[ResponseValueResolver.NamesContractResolver.GetResolvedPropertyName(a.Name).Replace(" ", "")] = a.Value;
                            break;
                        default:
                            configuration[ResponseValueResolver.NamesContractResolver.GetResolvedPropertyName(a.Name).Replace(" ", "")] = a.Value;
                            break;
                    }

                });


            }
            return configuration;
        }
    }

    /// <summary>
    /// 
    /// </summary>
    public class LocationResponseValueResolver : IValueResolver<SurveyResponse, LocationResponseViewModel, List<LocationResponseValueViewModel>>
    {
        public List<LocationResponseValueViewModel> Resolve(SurveyResponse source, LocationResponseViewModel destination, List<LocationResponseValueViewModel> destMember, ResolutionContext context)
        {
            List<LocationResponseValueViewModel> responseValues = new List<LocationResponseValueViewModel>();
            foreach (var response in source.ResponseValues)
            {
                var locationResponse = response as LocationResponse;

                responseValues.Add(new LocationResponseValueViewModel()
                {
                    Address = locationResponse.Address,
                    Latitude = locationResponse.Location.Y,
                    Longitude = locationResponse.Location.X

                });
            }
            return responseValues;
        }
    }

    /// <summary>
    /// Converts the response value generic to a dictionary of key - values
    /// </summary>
    /// <typeparam name="string"></typeparam>
    /// <typeparam name="object"></typeparam>
    public class ResponseValueResolver : IValueResolver<SurveyResponse, SurveyResponseViewModel, List<Dictionary<string, object>>>
    {
        public static CamelCasePropertyNamesContractResolver NamesContractResolver;
        static ResponseValueResolver()
        {
            NamesContractResolver = new CamelCasePropertyNamesContractResolver();
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="source"></param>
        /// <param name="destination"></param>
        /// <param name="destMember"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        public List<Dictionary<string, object>> Resolve(SurveyResponse source,
        SurveyResponseViewModel destination, List<Dictionary<string, object>> destMember, ResolutionContext context)
        {

            List<Dictionary<string, object>> responseValues = new List<Dictionary<string, object>>();
            foreach (var response in source.ResponseValues)
            {

                var obj = response.GetType()
                            .GetProperties(BindingFlags.Instance | BindingFlags.Public).Where(f =>
                            {
                                return f.PropertyType != typeof(SurveyResponse) && f.Name != "Id";
                            })
                          .ToDictionary<PropertyInfo, string, object>(prop => NamesContractResolver.GetResolvedPropertyName(prop.Name), prop => prop.GetValue(response, null));

                if (response is TimelineResponse res)
                {
                    obj["latitude"] = res.Location.Coordinate.Y;
                    obj["longitude"] = res.Location.Coordinate.X;
                }
                responseValues.Add(obj);

            }

            return responseValues;
        }
    }
}
