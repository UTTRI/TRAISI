using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk.Questions
{
    [SurveyQuestion(QuestionResponseType.Location, CodeBundleName = "traisi-questions-map.module.js")]
    public class MapQuestion : QuestionHook, ISurveyQuestion
    {
        public string TypeName
        {
            get => "location";
        }

        public virtual string Icon
        {
            get => "fas fa-map-marker-alt";
        }

        public QuestionIconType IconType
        {
            get => QuestionIconType.FONT;
        }


        [QuestionConfiguration(ConfigurationValueType.String,
            DisplayName = "Mapbox Style",
            Description = "Style string to use for map.",
            SurveyBuilderValueType = QuestionBuilderType.Text,
            DefaultValue = "mapbox://styles/mapbox/streets-v9?optimize=true")]
        public string Style = "mapbox://styles/mapbox/streets-v9?optimize=true";

        [QuestionConfiguration(ConfigurationValueType.String,
            DisplayName = "Mapbox Access Token",
            Description = "API Access token for the Mapbox service.",
            SurveyBuilderValueType = QuestionBuilderType.Text,
            DefaultValue = "")]
        public string AccessToken = "";

        [QuestionConfiguration(ConfigurationValueType.Integer,
            DisplayName = "Mapbox Default Zoom",
            Description = "Initial zoom level.",
            SurveyBuilderValueType = QuestionBuilderType.NumericText,
            DefaultValue = "8")]
        public int Zoom = 8;

        [QuestionConfiguration(ConfigurationValueType.Tuple,
            DisplayName = "Mapbox Default Centre",
            Description = "Initial centre location.",
            SurveyBuilderValueType = QuestionBuilderType.Location,
            DefaultValue = "-79.40|43.67")]
        public Tuple<double, double> Centre = new Tuple<double, double>(-79.40, 43.67);

        [QuestionConfiguration(ConfigurationValueType.Custom,
            DisplayName = "Purpose",
            Description = "Purpose of being at location.",
            SurveyBuilderValueType = QuestionBuilderType.SingleSelect,
            DefaultValue = "home",
            Resource = "mapquestion-purpose")]
        public string Purpose = "home";


        public const string HomeLocationProperty = "Home Location";
        
        [QuestionConfiguration(ConfigurationValueType.Boolean,
            DisplayName = HomeLocationProperty,
            Description = "Whether or not this response will be saved as the respondent's home location.",
            SurveyBuilderValueType = QuestionBuilderType.Switch,
            DefaultValue = false)]
        public bool IsHomeLocation = false;

        public override void Execute(ISurveyRespondent respondent,  IEnumerable<IResponseType> responseValues, IEnumerable<IQuestionConfiguration>  config)
        {
            foreach(var x in config) {
                if(x.Name == HomeLocationProperty) {
                    if(bool.TryParse(x.Value, out var isHomeLocation)) {
                        if(isHomeLocation) {
                            respondent.HomeLocation = (responseValues.First() as ILocationResponse).Location;
                            respondent.HomeAddress = (responseValues.First() as ILocationResponse).Address;
                            break;
                        }
                    }
                }
            }

            return;
        }
    }
}