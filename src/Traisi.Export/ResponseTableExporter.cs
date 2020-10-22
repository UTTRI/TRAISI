using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OfficeOpenXml;
using System.Text.Json;
using System.Threading.Tasks;
using System.Data;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using Traisi.Data;
using Traisi.Controllers;
using Traisi.Sdk.Services;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Sdk.Enums;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Models.Questions;
using Traisi.Sdk.Interfaces;

namespace TRAISI.Export
{
    public class ResponseTableExporter
    {
        private readonly ApplicationDbContext _context;
        private readonly QuestionTypeManager _questionTypeManager;

        //private readonly GeoServiceController _geocontroller;
        String locationPart = "";

        //Data Guide Transit Codes
        /*  Dictionary<string, string> data_guide_codes = new Dictionary<string, string>()
         {
             {"TTCBUS", "T"},
             {"TTCTRAMWAY", "T"},
             {"TTCSUBWAY", "T59"},
             {"TTCMETRO", "T59"},
             {"GOTRAIN", "GT0"},
             {"GOBUS", "GB"},
             {"BARRIEBUS", "BA"},
             {"BRADFORDBUS", "BD"},
             {"BRAMPTONBUS", "BR"},
             {"BRANTFORD", "BT"},
             {"BURLINGTONBUS", "BU"},
             {"COLLINGWOODBUS", "CO"},
             {"DURHAMBUS", "D"},
             {"FERGUSBUS", "FG"},
             {"FORTERIEBUS", "FE"},
             {"GUELPHBUS", "GU"},
             {"HAMILTONBUS", "HA"},
             {"LINDSAYBUS", "LI"},
             {"MIDLANDBUS", "MI"},
             {"MILTONBUS", "ML"},
             {"MIWAYBUS", "MS"},
             {"NIAGARAFALLSBUS", "NI"},
             {"NIAGARAREGIONBUS", "NR"},
             {"OAKVILLEBUS", "OA"},
             {"ORANGEVILLEBUS", "OV"},
             {"ORILLIABUS", "OR"},
             {"PETERBOROUGHBUS", "PE"},
             {"STCATHERINESBUS", "SC"},
             {"YRTBUS", "Y"},
             {"UPEXPRESSTRAIN", "GT10"}
         };
  */
        //Mapping Transit Numbers with Data Guide Transit Codes
        /* Dictionary<string, string> dg_codes_replacement = new Dictionary<string, string>()
        {
            {"LW", "GT01"},
            {"ML", "GT02"},
            {"KI", "GT03"},
            {"BR", "GT05"},
            {"RH", "GT06"},
            {"ST", "GT07"},
            {"LE", "GT09"},
            {"blue", "Y900"},
            {"purple", "Y901"},
            {"green", "Y902"},
            {"pink", "Y903"},
            {"orange", "Y904"},
            {"yellow", "Y905"},
            {"1A", "BA101"},
            {"1B", "BA102"},
            {"2A", "BA103"},
            {"2B", "BA104"},
            {"3A", "BA105"},
            {"3B", "BA106"},
            {"4A", "BA107"},
            {"4B", "BA108"},
            {"5A", "BA109"},
            {"5B", "BA110"},
            {"6A", "BA111"},
            {"6B", "BA112"},
            {"7A", "BA113"},
            {"78", "BA114"},
            {"8A", "BA115"},
            {"8B", "BA116"},
            {"057A","Y057"}
        };
 */

        /// <summary>
        /// Initializer for helper object
        /// </summary>
        /// <param name="context"></param>
        /// <param name="questionTypeManager"></param>
        public ResponseTableExporter(ApplicationDbContext context, QuestionTypeManager questionTypeManager)
        {
            _context = context;
            if (questionTypeManager != null)
            {
                _questionTypeManager = questionTypeManager;
            }
            else
            {
                _questionTypeManager = new QuestionTypeManager(null, new NullLoggerFactory());
                _questionTypeManager.LoadQuestionExtensions("../TRAISI/extensions");
            }

            //this._geocontroller = new GeoServiceController(null, null);
        }

        public List<SurveyResponse> ResponseList(List<QuestionPartView> questionPartViews)
        {
            return _context.SurveyResponses.AsQueryable()
                .Where(r => questionPartViews.Select(v => v.QuestionPart).Contains(r.QuestionPart))
                .Include(r => r.ResponseValues)
                .Include(r => r.QuestionPart)
                .Include(r => r.Respondent)
                .ThenInclude(r => r.SurveyRespondentGroup)
                .ThenInclude(r => r.GroupMembers)
                .OrderBy(r => r.UpdatedDate)
                .ToList();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyResponse"></param>
        /// <returns></returns>
        public object ReadSingleResponse(SurveyResponse surveyResponse)
        {
            var questionTypeDefinition =
                _questionTypeManager.QuestionTypeDefinitions[surveyResponse.QuestionPart.QuestionType];

            switch (questionTypeDefinition.ResponseType)
            {
                case QuestionResponseType.String:
                    return ((StringResponse)surveyResponse.ResponseValues.First()).Value;
                case QuestionResponseType.Number:
                    return ((NumberResponse)surveyResponse.ResponseValues.First()).Value;
                case QuestionResponseType.DateTime:
                    return ((DateTimeResponse)surveyResponse.ResponseValues.First()).Value;
                case QuestionResponseType.Path:
                    return ReadPathResponse(surveyResponse);
                case QuestionResponseType.Json:
                    return ReadJsonResponse(surveyResponse);
                case QuestionResponseType.Location:
                    {
                        String retValue = "";
                        if (locationPart == "")
                            retValue = ReadLocationResponse(surveyResponse);
                        else
                            retValue = ReadSplitLocation(surveyResponse, locationPart);

                        locationPart = "";
                        return retValue;
                    }
                case QuestionResponseType.Timeline:
                    return ReadTimelineResponse(surveyResponse);
                case QuestionResponseType.OptionSelect:
                    return ((OptionSelectResponse)surveyResponse.ResponseValues.FirstOrDefault())?.Value;
                case QuestionResponseType.Boolean:
                    // this type is currently not implemented in in ResponseTypes
                    throw new NotImplementedException("Tried to export boolean type");
                case QuestionResponseType.Time:
                    // this type is currently not implemented in in ResponseTypes
                    throw new NotImplementedException("Tried to export time type");
                case QuestionResponseType.None:
                    return "";
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        private string ReadJsonResponse(SurveyResponse response)
        {
            var responseValues = response.ResponseValues.Cast<JsonResponse>().Select(
                t => new
                {
                    t.Value
                });
            return JsonSerializer.Serialize(responseValues);

        }

        /* private List<Tuple<string, string>> ReadJsonResponse_Mode(SurveyResponse response)
        {
            List<Tuple<string, string>> modeDetails = new List<Tuple<string, string>>();
            var responseValues = response.ResponseValues.Cast<JsonResponse>().Select(
                t => new
                {
                    t.Value
                });

            foreach (var modeData in responseValues)
            {
                JObject responseJson = JObject.Parse(modeData.Value);
                string modeName = (string)responseJson.SelectToken("_tripLegs[0]._mode.modeName");
                string modeCat = (string)responseJson.SelectToken("_tripLegs[0]._mode.modeCategory");
                modeDetails.Add(new Tuple<string, string>(modeName, modeCat));
            }
            return modeDetails;
        }
         */

        /* private string GetValuesFromTripLinxData(JObject objTripLinx, string key, int sectionNumber = 0)
        {
            string returnValue = string.Empty;
            bool strPTRide = true;
            try
            {
                try
                {
                    strPTRide = objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"].HasValues;
                }
                catch
                {
                    strPTRide = true;
                }
                switch (key)
                {
                    case "Mode_Accs":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][0]["Leg"]["TransportMode"];
                        break;

                    case "Egrs_Mode":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][2]["Leg"]["TransportMode"];
                        break;

                    //Route details 
                    case "Route_Accs_Stn_Num":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Departure"]["StopPlace"]["importId"];
                        break;

                    case "Route_Accs_Stn_Name":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Departure"]["StopPlace"]["Name"];
                        break;

                    case "Route_Accs_Stn_Lat":
                        if (!strPTRide)
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["Leg"]["Departure"]["Site"]["Position"]["Lat"];
                        }
                        else
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Departure"]["StopPlace"]["Position"]["Lat"];
                        }
                        break;

                    case "Route_Accs_Stn_Lng":
                        if (!strPTRide)
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["Leg"]["Departure"]["Site"]["Position"]["Long"];
                        }
                        else
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Departure"]["StopPlace"]["Position"]["Long"];
                        }
                        break;

                    case "Route_Egrs_Stn_Num":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Arrival"]["StopPlace"]["importId"];
                        break;

                    case "Route_Egrs_Stn_Name":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Arrival"]["StopPlace"]["Name"];
                        break;

                    case "Route_Egrs_Stn_Lat":
                        if (!strPTRide)
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["Leg"]["Arrival"]["Site"]["Position"]["Lat"];
                        }
                        else
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Arrival"]["StopPlace"]["Position"]["Lat"];
                        }
                        break;

                    case "Route_Egrs_Stn_Lng":
                        if (!strPTRide)
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["Leg"]["Arrival"]["Site"]["Position"]["Long"];
                        }
                        else
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Arrival"]["StopPlace"]["Position"]["Long"];
                        }
                        break;

                    case "Route_Oper_Code":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Operator"]["Code"];
                        break;

                    case "Route_Trans_Num":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Line"]["Number"];
                        break;

                    case "Route_Trans_Name":
                        returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["Line"]["Name"];
                        break;

                    case "Route_Trans_Mode":
                        if (!strPTRide)
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["Leg"]["TransportMode"];
                        }
                        else
                        {
                            returnValue = (string)objTripLinx["response"]["trips"]["Trip"][0]["sections"]["Section"][sectionNumber]["PTRide"]["TransportMode"];
                        }
                        break;

                    default:
                        break;
                }
            }
            catch (System.Exception)
            {
                returnValue = string.Empty;
            }
            return returnValue;
        }
 */
        private string ReadPathResponse(SurveyResponse surveyResponse) => throw new NotImplementedException();//return null;

        private string ReadTimelineResponse(ISurveyResponse surveyResponse)
        {
            var locations = surveyResponse.ResponseValues.Cast<TimelineResponse>().OrderBy(t => t.Order)
                .Select(t => new
                {
                    t.Name,
                    t.Purpose,
                    t.TimeA,
                    t.TimeB,
                    t.Mode,
                    Location = new { t.Address, t.Location.X, t.Location.Y }
                });

            var locationJson = JsonSerializer.Serialize(locations);
            return locationJson;
        }

        private dynamic ReadTimelineResponseList(ISurveyResponse surveyResponse)
        {
            var locations = surveyResponse.ResponseValues.Cast<TimelineResponse>().OrderBy(t => t.Order)
                .Select(t => new
                {
                    t.Name,
                    t.Purpose,
                    t.Mode,
                    t.TimeA,
                    t.TimeB,
                    t.Address,
                    t.Location.X,
                    t.Location.Y
                });
            return locations;
        }

        private string ReadLocationResponse(ISurveyResponse surveyResponse)
        {
            var locations = surveyResponse.ResponseValues.Cast<LocationResponse>()
                .Select(t => new
                {
                    Location = new { t.Address, t.Location.X, t.Location.Y }
                });

            var locationJson = JsonSerializer.Serialize(locations);
            return locationJson;
        }


        /*     /// <summary>
            /// TODO: REIMPLEMENT TRIPLIINX CALL
            /// </summary>
            /// <param name="lato"></param> 
            /// <param name="lngo"></param>
            /// <param name="latd"></param>
            /// <param name="lngd"></param>
            /// <param name="mode"></param>
            /// <param name="transitModes"></param>
            /// <param name="date"></param>
            /// <returns></returns> */
        /* private async Task<JObject> ReadTripLinxData(double lato, double lngo, double latd, double lngd, string mode, string transitModes, DateTime date)
        {

            //JObject jo = JObject.Parse(await this._geocontroller.GetTripLinxRoutePlanner(lato, lngo, latd, lngd, mode, transitModes, date));
           // return jo;
            return null;
        } */

        private string ReadSplitLocation(ISurveyResponse surveyResponse, String locationPart)
        {
            string value = String.Empty;

            switch (locationPart)
            {
                case "_address":
                    string addressWithPostalCode = (((LocationResponse)surveyResponse.ResponseValues.First()).Address).FormattedAddress;
                    return addressWithPostalCode;

                case "_postalCode":
                    string addressOnlyPostalCode = (((LocationResponse)surveyResponse.ResponseValues.First()).Address).PostalCode;
                    return addressOnlyPostalCode;

                case "_yLatitude":
                    value = (((LocationResponse)surveyResponse.ResponseValues.First()).Location.Y).ToString();
                    return value;

                case "_xLongitude":
                    value = (((LocationResponse)surveyResponse.ResponseValues.First()).Location.X).ToString();
                    return value;
            }
            return value;
        }

        private void PathResponseTable(SurveyResponse surveyResponse, ExcelWorksheet worksheet)
        {
            throw new NotImplementedException();
        }

        private void TimelineResponseTable(SurveyResponse surveyResponse, ExcelWorksheet worksheet)
        {
        }

        public void ResponsesPivot_TravelDiary(
            List<QuestionPart> questionParts,
            List<SurveyResponse> surveyResponses,
            List<SurveyRespondent> surveyRespondents,
            ExcelWorksheet worksheet)
        {
            var responseValuesTask = Task.Run(() =>
                surveyResponses
                    .AsParallel()
                    .WithExecutionMode(ParallelExecutionMode.ForceParallelism)
                    .Select(ReadSingleResponse)
                    .ToList()
                );
            // Place headers
            // inject header
            var headerRow = new List<string[]>()
            {
                new string[] { "RespId_Num", "HhId_Num", "Pers_Num", "Trip_Num", "Trip_Orig_Lat", "Trip_Orig_Lng",
                "Loc_Num_Orig", "Loc_Ident_Orig", "Loc_Name_Orig", "Addr_Orig", "Post_Code_Orig",
                "Trip_Orig_CTuid", "Trip_Orig_CSDuid", "Trip_Orig_TTS2021", "Trip_Orig_PD",
                "Trip_Orig_Region", "Trip_Dest_Lat", "Trip_Dest_Lng", "Loc_Num_Dest", "Loc_Ident_Dest",
                "Loc_Name_Dest", "Addr_Dest", "Post_Code_Dest", "Trip_Dest_CTuid", "Trip_Dest_CSDuid",
                "Trip_Dest_TTS2021", "Trip_Dest_PD", "Trip_Dest_Region", "Cmp_Multi_Mode_Cat_key",
                "Cmp_Multi_Mode_Cat_Name", "Cmp_Multi_Mode_Cat_Main_Group", "Trip_Incl_Driv", "Trip_Incl_Pass",
                "Trip_Incl_PT", "Trip_Incl_Walk", "Trip_Incl_Bike", "Trip_Incl_Other_Mode", "Trip_Main_Pt_Mode",
                "Trip_Incl_PT_Bus", "Trip_Incl_PT_Streetcar", "Trip_Incl_PT_Subway", "Trip_Incl_PT_GO_Bus",
                "Trip_Incl_PT_GO_Train", "Trip_Orig_Purp", "Trip_Dest_Purp", "Trip_Date_Ext",
                "Trip_Day_Ext", "Trip_Start_Time_Ext", "Act_Date", "Act_Day", "Act_End_Time", "Trip_Modes",
                "Trip_Num_Unique_Modes", "Sing_Trip_Diary_Flag", "Incomp_Diary", "Survey_Access_Date_Time",
                "Survey_Access_Day" }
            };
            worksheet.Cells["A1:BE1"].LoadFromArrays(headerRow);
            worksheet.Cells["A1:BE1"].Style.Font.Bold = true;

            // Collecting all relevant respondents
            var Respondents_valid = surveyRespondents.Where(x => surveyResponses.Any(y => y.Respondent == x)).ToList();
            var subRespondents = Respondents_valid.SelectMany(pr => pr.SurveyRespondentGroup.GroupMembers).ToList();

            int locNumber = 0;
            int rowNumber = 1;

            //Location Identifier
            Dictionary<Tuple<double, double>, int> Location_Identification = new Dictionary<Tuple<double, double>, int>();

            foreach (var respondent in subRespondents)
            {
                var responses = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent)).ToList();

                //Location number
                locNumber = 0;
                //Trip number
                int trpNumber = 0;

                if (responses.Count() == 0)
                {
                    continue;
                }
                //Travel diary
                var response_timeline = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                            .Where(r => r.Respondent == respondent)
                                                                .Where(y => y.QuestionPart.Name == "Travel diary");
                //Transit routes
                var response_Json = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                        .Where(r => r.Respondent == respondent)
                                                            .Where(y => y.QuestionPart.Name == "Transit routes");

                if (response_timeline.Count() == 0)
                    continue;

                //Reading Mode Details 
                //List<Tuple<string, string>> modeDetails = ReadJsonResponse_Mode(response_Json.First());

                var responseValues_timeline_1 = ReadTimelineResponseList(response_timeline.First());
                List<dynamic> responseValues_timeline = new List<object>();

                foreach (var item in responseValues_timeline_1)
                {
                    responseValues_timeline.Add(item);
                }

                for (int i = 0; i < responseValues_timeline.Count() - 1; i++)
                {
                    //Origin
                    var response = responseValues_timeline[i];

                    //Destination
                    var response_dest = responseValues_timeline[i + 1];

                    rowNumber++;
                    locNumber++;
                    trpNumber++;

                    //Origin
                    if (!Location_Identification.ContainsKey(new Tuple<double, double>(response.X, response.Y)))
                    {
                        Location_Identification.Add(new Tuple<double, double>(response.X, response.Y), Location_Identification.Count() + 1);
                    }
                    //Destination
                    if (!Location_Identification.ContainsKey(new Tuple<double, double>(response_dest.X, response_dest.Y)))
                    {
                        Location_Identification.Add(new Tuple<double, double>(response_dest.X, response_dest.Y), Location_Identification.Count() + 1);
                    }
                    // Respondent ID (Unique)          
                    worksheet.Cells[rowNumber, 1].Value = (responses.Where(r => r.Respondent == respondent)
                                                            .Select(r => r.Respondent.Id)).First().ToString();
                    // Household ID        
                    worksheet.Cells[rowNumber, 2].Value = (responses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                            .Select(r => r.Respondent.SurveyRespondentGroup.Id)).First().ToString();
                    //Person ID 
                    worksheet.Cells[rowNumber, 3].Value = (responses.Where(r => r.Respondent == respondent)
                                                            .Select(r => r.Respondent.SurveyRespondentGroup.GroupMembers.IndexOf(respondent) + 1)).First().ToString();
                    //Trip Number  
                    worksheet.Cells[rowNumber, 4].Value = trpNumber.ToString();

                    //Trip Origin Latitude 
                    worksheet.Cells[rowNumber, 5].Value = response.Y.ToString();

                    //Trip Origin Longitude 
                    worksheet.Cells[rowNumber, 6].Value = response.X.ToString();

                    //Location Number Origin
                    worksheet.Cells[rowNumber, 7].Value = locNumber.ToString();

                    //Location Identifier Origin
                    worksheet.Cells[rowNumber, 8].Value = Convert.ToString(Location_Identification[new Tuple<double, double>(response.X, response.Y)]);

                    //Location Name Origin
                    worksheet.Cells[rowNumber, 9].Value = response.Name;

                    //Address Origin
                    string addressWithPostalCode = response.Address.FormattedAddress;
                    worksheet.Cells[rowNumber, 10].Value = addressWithPostalCode;

                    //Postalcode Origin
                    string addressOnlyPostalCode = response.Address.PostalCode;
                    worksheet.Cells[rowNumber, 11].Value = addressOnlyPostalCode;

                    //TpOrigCTuid 
                    worksheet.Cells[rowNumber, 12].Value = String.Empty;

                    //TpOrigCSDuid
                    worksheet.Cells[rowNumber, 13].Value = String.Empty;

                    //TpOrigTTS2021 
                    worksheet.Cells[rowNumber, 14].Value = String.Empty;

                    //TpOrigPD
                    worksheet.Cells[rowNumber, 15].Value = String.Empty;

                    //TpOrigRegion
                    worksheet.Cells[rowNumber, 16].Value = String.Empty;

                    //Trip Destination Latitude 
                    worksheet.Cells[rowNumber, 17].Value = response_dest.Y.ToString(); ;

                    //Trip Destination Longitude 
                    worksheet.Cells[rowNumber, 18].Value = response_dest.X.ToString(); ;

                    //Location Number Destination
                    worksheet.Cells[rowNumber, 19].Value = locNumber.ToString();

                    //Location Identifier Destination
                    worksheet.Cells[rowNumber, 20].Value = Convert.ToString(Location_Identification[new Tuple<double, double>(response_dest.X, response_dest.Y)]);

                    //Location Name Destination
                    worksheet.Cells[rowNumber, 21].Value = response_dest.Name;

                    //Address Destination
                    string addressWithPostalCode_Dest = response.Address.FormattedAddress;
                    worksheet.Cells[rowNumber, 22].Value = addressWithPostalCode_Dest;

                    //Postalcode Destination
                    string addressOnlyPostalCode_Dest = response.Address.PostalCode;
                    worksheet.Cells[rowNumber, 23].Value = addressOnlyPostalCode_Dest;

                    //CmpMultiModeCatkey 
                    worksheet.Cells[rowNumber, 24].Value = String.Empty;

                    //CmpMultiModeCatName
                    worksheet.Cells[rowNumber, 30].Value = response_dest.Mode;

                    //Mode Details
                    /* if (modeDetails.Count >= locNumber)
                    {
                        //CmpMultiModeCatName 
                        worksheet.Cells[rowNumber, 30].Value = modeDetails[locNumber - 1].Item2;

                        //CmpMultiModeCatMainGroup
                        worksheet.Cells[rowNumber, 31].Value = modeDetails[locNumber - 1].Item1;
                    } */

                    //TpInclDriv
                    worksheet.Cells[rowNumber, 32].Value = String.Empty;

                    //TpInclPass
                    worksheet.Cells[rowNumber, 33].Value = String.Empty;

                    //TpInclPT
                    worksheet.Cells[rowNumber, 34].Value = String.Empty;

                    //TpInclWalk
                    worksheet.Cells[rowNumber, 35].Value = String.Empty;

                    //TpInclBike 
                    worksheet.Cells[rowNumber, 36].Value = String.Empty;

                    //TpInclOtherMode 
                    worksheet.Cells[rowNumber, 37].Value = String.Empty;

                    //TpMainPtMode 
                    worksheet.Cells[rowNumber, 38].Value = String.Empty;

                    //TpInclPTBus
                    worksheet.Cells[rowNumber, 39].Value = String.Empty;

                    //TpInclPTStreetcar
                    worksheet.Cells[rowNumber, 40].Value = String.Empty;

                    //TpInclPTSubway
                    worksheet.Cells[rowNumber, 41].Value = String.Empty;

                    //TpInclPTGOBus
                    worksheet.Cells[rowNumber, 42].Value = String.Empty;

                    //TpInclPTGOTrain
                    worksheet.Cells[rowNumber, 43].Value = String.Empty;

                    //Trip Origin Purpose
                    worksheet.Cells[rowNumber, 44].Value = response.Purpose;
                   
                    //Trip Destination Purpose
                    worksheet.Cells[rowNumber, 45].Value = response_dest.Purpose;
                    
                    //Departure columns 
                    string timeA = response_dest.TimeA.ToString();
                    if (Regex.IsMatch(timeA, @"([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))", RegexOptions.IgnoreCase))
                    {
                        //Departure Date 
                        Match dA = Regex.Match(timeA, @"([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))", RegexOptions.IgnoreCase);
                        Match tA = Regex.Match(timeA, @"(1[0-2]|0?[1-9]):(?:[012345]\d):(?:[012345]\d) ([AaPp][Mm])", RegexOptions.IgnoreCase);
                        worksheet.Cells[rowNumber, 46].Value = Convert.ToString(dA.Value);

                        //Departure Day 
                        DateTime dtA = DateTime.Parse(dA.Value);
                        worksheet.Cells[rowNumber, 47].Value = Convert.ToString(dtA.DayOfWeek);

                        //Departure Time
                        worksheet.Cells[rowNumber, 48].Value = Convert.ToString(tA.Value);
                    }
                    //Arrival columns 
                    string timeB = response_dest.TimeB.ToString();
                    if (Regex.IsMatch(timeB, @"((20|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))", RegexOptions.IgnoreCase))
                    {
                        //Arrival Date
                        Match dB = Regex.Match(timeB, @"((20|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))", RegexOptions.IgnoreCase);
                        Match tB = Regex.Match(timeB, @"(1[0-2]|0?[1-9]):(?:[012345]\d):(?:[012345]\d) ([AaPp][Mm])", RegexOptions.IgnoreCase);
                        worksheet.Cells[rowNumber, 49].Value = Convert.ToString(dB.Value);

                        //Arrival Day 
                        DateTime dtB = DateTime.Parse(dB.Value);
                        worksheet.Cells[rowNumber, 50].Value = Convert.ToString(dtB.DayOfWeek);

                        //Arrival Time 
                        worksheet.Cells[rowNumber, 51].Value = Convert.ToString(tB.Value);
                    } 
                    //TpModes
                    worksheet.Cells[rowNumber, 52].Value = String.Empty;

                    //TpNumUniqueModes
                    worksheet.Cells[rowNumber, 53].Value = String.Empty;

                    //SingTripdiaryFlag
                    worksheet.Cells[rowNumber, 54].Value = String.Empty;

                    //IncompDiary
                    worksheet.Cells[rowNumber, 55].Value = String.Empty;

                    // SurveyAccessDateTime
                    if (respondent is PrimaryRespondent primaryRespondent)
                    {
                        worksheet.Cells[rowNumber, 56].Value = primaryRespondent.SurveyAccessDateTime.DateTime.ToString("yyyy-MM-dd HH:mm:ss tt");
                        worksheet.Cells[rowNumber, 57].Value = primaryRespondent.SurveyAccessDateTime.DayOfWeek;
                    }
                    else if (respondent is SubRespondent subRespondent)
                    {
                        worksheet.Cells[rowNumber, 56].Value = subRespondent.PrimaryRespondent.SurveyAccessDateTime.DateTime.ToString("yyyy-MM-dd HH:mm:ss tt");
                        worksheet.Cells[rowNumber, 57].Value = subRespondent.PrimaryRespondent.SurveyAccessDateTime.DayOfWeek;
                    }
                    //Complete and Incomplete Samples Flag
                    //, "Survey_Complete_Flag"
                    //worksheet.Cells[rowNumber, 58].Value = String.Empty;
    
                } 
            }
        }

        /*  public void ResponsesPivot_TransitRoutes(
             List<QuestionPart> questionParts,
             List<SurveyResponse> surveyResponses,
             List<SurveyRespondent> surveyRespondents,
             ExcelWorksheet worksheet)
         {
             var responseValuesTask = Task.Run(() =>
                 surveyResponses
                     .AsParallel()
                     .WithExecutionMode(ParallelExecutionMode.ForceParallelism)
                     .Select(ReadSingleResponse)
                     .ToList()
                 );
             // Place headers
             // inject header
             var headerRow = new List<string[]>()
             {
                 new string[] { "RespId_Num", "HhId_Num", "Pers_Num", "Trip_Num", "Mode_Accs",
                 "Trip_Orig_Lat", "Trip_Orig_Lng", "Mode_Egrs", "Trip_Dest_Lat", "Trip_Dest_Lng",
                 "Route_1_Accs_Stn_Num", "Route_1_Accs_Stn_Name", "Route_1_Accs_Stn_Lat", "Route_1_Accs_Stn_Lng",
                 "Route_1_Egrs_Stn_Num", "Route_1_Egrs_Stn_Name", "Route_1_Egrs_Stn_Lat", "Route_1_Egrs_Stn_Lng",
                 "Route_1_Oper_Code", "Route_1_Trans_Num", "Route_1_Data_Guide_Code", "Route_1_Trans_Name", "Route_1_Trans_Mode",
                 "Route_2_Accs_Stn_Num", "Route_2_Accs_Stn_Name", "Route_2_Accs_Stn_Lat", "Route_2_Accs_Stn_Lng",
                 "Route_2_Egrs_Stn_Num", "Route_2_Egrs_Stn_Name", "Route_2_Egrs_Stn_Lat", "Route_2_Egrs_Stn_Lng",
                 "Route_2_Oper_Code", "Route_2_Trans_Num", "Route_2_Data_Guide_Code", "Route_2_Trans_Name", "Route_2_Trans_Mode",
                 "Route_3_Accs_Stn_Num", "Route_3_Accs_Stn_Name", "Route_3_Accs_Stn_Lat", "Route_3_Accs_Stn_Lng",
                 "Route_3_Egrs_Stn_Num", "Route_3_Egrs_Stn_Name", "Route_3_Egrs_Stn_Lat", "Route_3_Egrs_Stn_Lng",
                 "Route_3_Oper_Code", "Route_3_Trans_Num", "Route_3_Data_Guide_Code", "Route_3_Trans_Name", "Route_3_Trans_Mode",
                 "Route_4_Accs_Stn_Num", "Route_4_Accs_Stn_Name", "Route_4_Accs_Stn_Lat", "Route_4_Accs_Stn_Lng",
                 "Route_4_Egrs_Stn_Num", "Route_4_Egrs_Stn_Name", "Route_4_Egrs_Stn_Lat", "Route_4_Egrs_Stn_Lng",
                 "Route_4_Oper_Code", "Route_4_Trans_Num", "Route_4_Data_Guide_Code", "Route_4_Trans_Name","Route_4_Trans_Mode",
                 "Route_5_Accs_Stn_Num", "Route_5_Accs_Stn_Name", "Route_5_Accs_Stn_Lat", "Route_5_Accs_Stn_Lng",
                 "Route_5_Egrs_Stn_Num", "Route_5_Egrs_Stn_Name", "Route_5_Egrs_Stn_Lat", "Route_5_Egrs_Stn_Lng",
                 "Route_5_Oper_Code", "Route_5_Trans_Num", "Route_5_Data_Guide_Code", "Route_5_Trans_Name", "Route_5_Trans_Mode",
                 "Route_6_Accs_Stn_Num", "Route_6_Accs_Stn_Name", "Route_6_Accs_Stn_Lat", "Route_6_Accs_Stn_Lng",
                 "Route_6_Egrs_Stn_Num", "Route_6_Egrs_Stn_Name", "Route_6_Egrs_Stn_Lat", "Route_6_Egrs_Stn_Lng",
                 "Route_6_Oper_Code", "Route_6_Trans_Num", "Route_6_Data_Guide_Code", "Route_6_Trans_Name", "Route_6_Trans_Mode",
                 "Route_7_Accs_Stn_Num", "Route_7_Accs_Stn_Name", "Route_7_Accs_Stn_Lat", "Route_7_Accs_Stn_Lng",
                 "Route_7_Egrs_Stn_Num", "Route_7_Egrs_Stn_Name", "Route_7_Egrs_Stn_Lat", "Route_7_Egrs_Stn_Lng",
                 "Route_7_Oper_Code", "Route_7_Trans_Num", "Route_7_Data_Guide_Code", "Route_7_Trans_Name","Route_7_Trans_Mode",
                 "Route_8_Accs_Stn_Num", "Route_8_Accs_Stn_Name", "Route_8_Accs_Stn_Lat", "Route_8_Accs_Stn_Lng",
                 "Route_8_Egrs_Stn_Num", "Route_8_Egrs_Stn_Name", "Route_8_Egrs_Stn_Lat", "Route_8_Egrs_Stn_Lng",
                 "Route_8_Oper_Code", "Route_8_Trans_Num", "Route_8_Data_Guide_Code", "Route_8_Trans_Name", "Route_8_Trans_Mode",
                 "Route_9_Accs_Stn_Num", "Route_9_Accs_Stn_Name", "Route_9_Accs_Stn_Lat", "Route_9_Accs_Stn_Lng",
                 "Route_9_Egrs_Stn_Num", "Route_9_Egrs_Stn_Name", "Route_9_Egrs_Stn_Lat", "Route_9_Egrs_Stn_Lng",
                 "Route_9_Oper_Code", "Route_9_Trans_Num", "Route_9_Data_Guide_Code", "Route_9_Trans_Name", "Route_9_Trans_Mode",
                 "Route_10_Accs_Stn_Num", "Route_10_Accs_Stn_Name", "Route_10_Accs_Stn_Lat", "Route_10_Accs_Stn_Lng",
                 "Route_10_Egrs_Stn_Num", "Route_10_Egrs_Stn_Name", "Route_10_Egrs_Stn_Lat", "Route_10_Egrs_Stn_Lng",
                 "Route_10_Oper_Code", "Route_10_Trans_Num", "Route_10_Data_Guide_Code","Route_10_Trans_Name", "Route_10_Trans_Mode",
                 "Route_11_Accs_Stn_Num", "Route_11_Accs_Stn_Name", "Route_11_Accs_Stn_Lat", "Route_11_Accs_Stn_Lng",
                 "Route_11_Egrs_Stn_Num", "Route_11_Egrs_Stn_Name", "Route_11_Egrs_Stn_Lat", "Route_11_Egrs_Stn_Lng",
                 "Route_11_Oper_Code", "Route_11_Trans_Num", "Route_11_Data_Guide_Code","Route_11_Trans_Name", "Route_11_Trans_Mode",
                 "Use_TTC", "N_Route", "Last_Route", "Last_Route_Data_Guide_Code", "N_Go_Rail", "N_Go_Bus", "N_Subway", "N_TTC_Bus", "N_Local",
                 "N_Other"
                 }
             };
             worksheet.Cells["A1:FG1"].LoadFromArrays(headerRow);
             worksheet.Cells["A1:FG1"].Style.Font.Bold = true;

             // Collecting all relevant respondents
             var Respondents_valid = surveyRespondents.Where(x => surveyResponses.Any(y => y.Respondent == x)).ToList();
             var subRespondents = Respondents_valid.SelectMany(pr => pr.SurveyRespondentGroup.GroupMembers).ToList();
             int locNumber = 0;
             int rowNumber = 1;

             foreach (var respondent in subRespondents)
             {
                 var responses = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent)).ToList();

                 //Location number
                 locNumber = 0;
                 //Trip number
                 int trpNumber = 0;

                 if (responses.Count() == 0)
                 {
                     continue;
                 }
                 //Timeline
                 var response_timeline = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                             .Where(r => r.Respondent == respondent)
                                                                 .Where(y => y.QuestionPart.Name == "Timeline");
                 //Travel modes
                 var response_Json = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                         .Where(r => r.Respondent == respondent)
                                                             .Where(y => y.QuestionPart.Name == "Travel modes");

                 if (response_timeline.Count() == 0)
                     continue;

                 //Reading Mode Details 
                 List<Tuple<string, string>> modeDetails = ReadJsonResponse_Mode(response_Json.First());

                 var responseValues_timeline_1 = ReadTimelineResponseList(response_timeline.First());
                 List<dynamic> responseValues_timeline = new List<object>();

                 foreach (var item in responseValues_timeline_1)
                 {
                     responseValues_timeline.Add(item);
                 }

                 for (int i = 0; i < responseValues_timeline.Count() - 1; i++)
                 {
                     locNumber++;
                     trpNumber++;

                     //Origin
                     var response = responseValues_timeline[i];

                     //Destination
                     var response_dest = responseValues_timeline[i + 1];

                     //TripLinx Data
                     string jsonTripLinx = string.Empty;
                     JObject objTripLinx = null;

                     try
                     {
                         Task<JObject> TaskObjTripLinks = ReadTripLinxData(response.Y, response.X, response_dest.Y, response_dest.X, "PT", "", DateTime.Now);
                         objTripLinx = TaskObjTripLinks.Result;
                         objTripLinx = (JObject)objTripLinx["Data"][0];
                     }
                     catch (System.Exception)
                     {
                         objTripLinx = null;
                     }

                     if (objTripLinx == null || modeDetails[locNumber - 1].Item1 != "transit-all-way")
                         continue;
                     rowNumber++;

                     // Respondent ID (Unique)          
                     worksheet.Cells[rowNumber, 1].Value = (responses.Where(r => r.Respondent == respondent)
                                                             .Select(r => r.Respondent.Id)).First().ToString();
                     // Household ID        
                     worksheet.Cells[rowNumber, 2].Value = (responses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                             .Select(r => r.Respondent.SurveyRespondentGroup.Id)).First().ToString();
                     //Person ID 
                     worksheet.Cells[rowNumber, 3].Value = (responses.Where(r => r.Respondent == respondent)
                                                             .Select(r => r.Respondent.SurveyRespondentGroup.GroupMembers.IndexOf(respondent) + 1)).First().ToString();
                     //Trip Number  
                     worksheet.Cells[rowNumber, 4].Value = trpNumber.ToString();

                     //Mode_Accs 
                     worksheet.Cells[rowNumber, 5].Value = GetValuesFromTripLinxData(objTripLinx, "Mode_Accs");

                     //Trip_Orig_Lat
                     worksheet.Cells[rowNumber, 6].Value = response.Y;

                     //Trip_Orig_Lng
                     worksheet.Cells[rowNumber, 7].Value = response.X;

                     //Mode_Egrs
                     worksheet.Cells[rowNumber, 8].Value = GetValuesFromTripLinxData(objTripLinx, "Egrs_Mode");

                     //Trip_Dest_Lat
                     worksheet.Cells[rowNumber, 9].Value = response_dest.Y;

                     //Trip_Dest_Lng
                     worksheet.Cells[rowNumber, 10].Value = response_dest.X;

                     //Routes numbers list
                     List<string> route_Numbers = new List<string>();

                     //Routes numbers data guide list
                     List<string> route_Numbers_DG = new List<string>();

                     //GO bus and train; TTC bus and subway; Non-TTC and Non-GO data
                     int go_Bus = 0;
                     int go_Train = 0;
                     int ttc_Bus = 0;
                     int ttc_Train = 0;
                     int n_Local = 0;

                     //Checking for Operator Code TTC or not
                     string ttcValue = "N";

                     //Looping routes, collects section info from Triplinx and outputs to excel columns
                     for (int sectionNum = 1; sectionNum <= 11; sectionNum++)
                     {
                         int rowNumberAddition = (sectionNum - 1) * 13;
                         //Route_Accs_Stn_Num
                         worksheet.Cells[rowNumber, 11 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Accs_Stn_Num", sectionNum);

                         //Route_Accs_Stn_Name
                         worksheet.Cells[rowNumber, 12 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Accs_Stn_Name", sectionNum);

                         //Route_Accs_Stn_Lat
                         worksheet.Cells[rowNumber, 13 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Accs_Stn_Lat", sectionNum);

                         //Route_Accs_Stn_Lng
                         worksheet.Cells[rowNumber, 14 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Accs_Stn_Lng", sectionNum);

                         //Route_Egrs_Stn_Num
                         worksheet.Cells[rowNumber, 15 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Egrs_Stn_Num", sectionNum);

                         //Route_Egrs_Stn_Name
                         worksheet.Cells[rowNumber, 16 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Egrs_Stn_Name", sectionNum);

                         //Route_Egrs_Stn_Lat
                         worksheet.Cells[rowNumber, 17 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Egrs_Stn_Lat", sectionNum);

                         //Route_Egrs_Stn_Lng
                         worksheet.Cells[rowNumber, 18 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Egrs_Stn_Lng", sectionNum);

                         //Route_Oper_Code
                         string operator_Code = GetValuesFromTripLinxData(objTripLinx, "Route_Oper_Code", sectionNum);
                         worksheet.Cells[rowNumber, 19 + rowNumberAddition].Value = operator_Code;

                         //Checking for Operator Code TTC or not
                         if (ttcValue != "Y")
                             ttcValue = (operator_Code == "TTC") ? "Y" : "N";

                         //Route_Trans_Num 
                         string RouteTransNum = GetValuesFromTripLinxData(objTripLinx, "Route_Trans_Num", sectionNum);
                         if (!string.IsNullOrEmpty(RouteTransNum))
                         {
                             route_Numbers.Add(RouteTransNum);
                         }
                         worksheet.Cells[rowNumber, 20 + rowNumberAddition].Value = RouteTransNum;

                         //Route_Trans_Mode 
                         string trans_Mode = GetValuesFromTripLinxData(objTripLinx, "Route_Trans_Mode", sectionNum);
                         worksheet.Cells[rowNumber, 23 + rowNumberAddition].Value = trans_Mode;

                         //DataGuide Transit Code
                         string data_guide_RouteTransNum = string.Empty;
                         string dg_replace_value = string.Empty;

                         //Replace Transit Number with DataGuide codes
                         if (dg_codes_replacement.TryGetValue(RouteTransNum, out dg_replace_value))
                         {
                             data_guide_RouteTransNum = dg_replace_value;
                             route_Numbers_DG.Add(data_guide_RouteTransNum);
                         }
                         else if (!string.IsNullOrEmpty(RouteTransNum))
                         {
                             //Checks for OperatorCode and Maps with DataGuide codes.
                             if (operator_Code == "TTC" && (trans_Mode == "BUS" || trans_Mode == "TRAMWAY"))
                             {
                                 if (RouteTransNum.Length == 1)
                                     RouteTransNum = "00" + RouteTransNum;

                                 if (RouteTransNum.Length == 2)
                                     RouteTransNum = "0" + RouteTransNum;
                             }
                             else if (operator_Code == "YRT")
                             {
                                 if (RouteTransNum.Length == 1)
                                     RouteTransNum = "00" + RouteTransNum;

                                 if (RouteTransNum.Length == 2)
                                     RouteTransNum = "0" + RouteTransNum;
                             }
                             else if (operator_Code != "TTC")
                             {
                                 if (RouteTransNum.Length == 1)
                                     RouteTransNum = "0" + RouteTransNum;
                             }
                             //DataGuide Code value
                             string data_guide_code_value = string.Empty;

                             if (data_guide_codes.TryGetValue(operator_Code + trans_Mode, out data_guide_code_value))
                             {
                                 data_guide_RouteTransNum = data_guide_code_value + RouteTransNum;
                                 route_Numbers_DG.Add(data_guide_RouteTransNum);
                             }
                         }
                         //Route_Data_Guide_Code 
                         worksheet.Cells[rowNumber, 21 + rowNumberAddition].Value = data_guide_RouteTransNum;

                         //Route_Trans_Name
                         worksheet.Cells[rowNumber, 22 + rowNumberAddition].Value = GetValuesFromTripLinxData(objTripLinx, "Route_Trans_Name", sectionNum);

                         //Calculate GO Bus and Train
                         if (operator_Code == "GO")
                         {
                             if (trans_Mode == "BUS")
                                 go_Bus++;
                             else
                                 go_Train++;
                         }
                         //Calculate TTC Bus, Streetcar and Subway
                         else if (operator_Code == "TTC")
                         {
                             if (trans_Mode == "METRO")
                                 ttc_Train++;
                             else
                                 ttc_Bus++;
                         }
                         //Calculate Non-TTC and Non-GO
                         else if (!string.IsNullOrEmpty(operator_Code))
                         {
                             n_Local++;
                         }
                     }
                     //Use_TTC
                     worksheet.Cells[rowNumber, 154].Value = ttcValue;

                     //N_Route
                     worksheet.Cells[rowNumber, 155].Value = route_Numbers.Count;

                     //Last_Route
                     worksheet.Cells[rowNumber, 156].Value = route_Numbers.LastOrDefault();

                     //Last_Route_Data_Guide_Code                   
                     worksheet.Cells[rowNumber, 157].Value = route_Numbers_DG.LastOrDefault();

                     //N_Go_Rail
                     worksheet.Cells[rowNumber, 158].Value = go_Train;

                     //N_Go_Bus
                     worksheet.Cells[rowNumber, 159].Value = go_Bus;

                     //N_Subway
                     worksheet.Cells[rowNumber, 160].Value = ttc_Train;

                     //N_TTC_Bus
                     worksheet.Cells[rowNumber, 161].Value = ttc_Bus;

                     //N_Local
                     worksheet.Cells[rowNumber, 162].Value = n_Local;

                     //N_Other
                     worksheet.Cells[rowNumber, 163].Value = String.Empty;

                 }

             }
         }

    */
        public void ResponseListToWorksheet(List<SurveyResponse> surveyResponses, ExcelWorksheet worksheet, Boolean isHouseHold)
        {
            //Removed Travel diary and Transit routes responses. 
            surveyResponses = surveyResponses.Where(res => res.QuestionPart.Name != "Travel diary" && res.QuestionPart.Name != "Transit routes").OrderBy(res => res.Respondent.Id).ToList();

            var responseValuesTask = Task.Run(() =>
                surveyResponses
                    .AsParallel()
                    .WithExecutionMode(ParallelExecutionMode.ForceParallelism)
                    .Select(ReadSingleResponse)
                    .ToList()
                );

            // Place headers
            // inject header
            if (!isHouseHold)
            {
                var headerRow = new List<string[]>()
            {
                new string[] { "RespId_Num","HhId_Num", "Pers_Num", "Hh_Memb_Name", "Hh_Memb_Relship", "Quest_Name", "Resp_Type", "Resp_Value", "Resp_Time" }
            };
                worksheet.Cells["A1:I1"].LoadFromArrays(headerRow);
                worksheet.Cells["A1:I1"].Style.Font.Bold = true;
            }
            else
            {
                var headerRow_Household = new List<string[]>()
            {
                new string[] { "RespId_Num","HhId_Num", "Quest_Name", "Resp_Type", "Resp_Value", "Resp_Time" }
            };
                worksheet.Cells["A1:F1"].LoadFromArrays(headerRow_Household);
                worksheet.Cells["A1:F1"].Style.Font.Bold = true;
            }

            var numberOfResponses = surveyResponses.Count;

            // Respondent ID (Unique)    
            var respondentIDs = surveyResponses.Select(r => new object[] { r.Respondent.Id }).ToList();
            worksheet.Cells[2, 1].LoadFromArrays(respondentIDs);

            // Household ID           
            var householdIds = surveyResponses.Select(r => new object[] { r.Respondent.SurveyRespondentGroup.Id }).ToList();
            worksheet.Cells[2, 2].LoadFromArrays(householdIds);

            //In House Person ID for only Personal Questions
            int colNumber = 3;
            if (!isHouseHold)
            {
                var personIds = surveyResponses.Select(r => new object[] { r.Respondent.SurveyRespondentGroup.GroupMembers.IndexOf(r.Respondent) + 1 }).ToList();
                worksheet.Cells[2, colNumber].LoadFromArrays(personIds);
                colNumber++;

                // Household member Name          
                var hhMemberName = surveyResponses.Select(r => new object[] { r.Respondent.Name }).ToList();
                worksheet.Cells[2, colNumber].LoadFromArrays(hhMemberName);
                colNumber++;

                // Household member Relationship      
                var hhMemberRelation_1 = surveyResponses.Select(r => new object[] { Convert.ToString(r.Respondent.GetType()), r.Respondent.Relationship }).ToList();
                foreach (var item in hhMemberRelation_1)
                {
                    //Assigning "Head" to Primary Respondent
                    if (item[0].ToString().Contains("PrimaryRespondent"))
                    {
                        item[1] = "Head";
                    }
                }
                var hhMemberRelation = hhMemberRelation_1.Select(r => new object[] { r[1] }).ToList();
                worksheet.Cells[2, colNumber].LoadFromArrays(hhMemberRelation);
                colNumber++;
            }
            // Question Name
            var questionNames = surveyResponses.Select(r => new object[] { r.QuestionPart.Name }).ToList();
            worksheet.Cells[2, colNumber].LoadFromArrays(questionNames);
            colNumber++;

            // Response Type
            var responseTypes = surveyResponses.Select(r => new object[]
            {
                _questionTypeManager.QuestionTypeDefinitions[r.QuestionPart.QuestionType].ResponseType
            }).ToList();
            worksheet.Cells[2, colNumber].LoadFromArrays(responseTypes);
            colNumber++;

            // Response Value
            responseValuesTask.Wait();
            var responseValues = responseValuesTask.Result.ToList();
            // filter responses if length is longer than 32767 as excel cell limit
            responseValues = responseValues.AsParallel().Select(r =>
            {
                if (r is string rs)
                {
                    if (rs.Length > 32766) return "Error: Contents too long for Excel.";
                }
                return r;
            }).ToList();
            worksheet.Cells[2, colNumber].LoadFromArrays(responseValues.Select(r => new object[] { r }).ToList());
            colNumber++;

            // Response Time
            var responseTimes = surveyResponses.Select(r => new object[] { r.UpdatedDate.ToString("g") }).ToList();
            worksheet.Cells[2, colNumber].LoadFromArrays(responseTimes);
            colNumber++;
        }

        public void ResponsesPivot_Personal(
        List<QuestionPart> questionParts,
        List<SurveyResponse> surveyResponses,
        List<SurveyRespondent> surveyRespondents,
        ExcelWorksheet worksheet)
        {
            //Removed Transit routes and Travel diary columns
            surveyResponses = surveyResponses.Where(res => res.QuestionPart.Name != "Travel diary" && res.QuestionPart.Name != "Transit routes").ToList();
            questionParts = questionParts.Where(res => res.Name != "Travel diary" && res.Name != "Transit routes").ToList();

            // process questions
            // build dictionary of questions and column numbers
            var questionColumnDict = new Dictionary<QuestionPart, int>();
            // place questions on headers and add to dictionary
            var columnNum = 6;

            // Adding Respondent, Household and Person ID column names 
            worksheet.Cells[1, 1].Value = "RespId_Num";
            worksheet.Cells[1, 2].Value = "HhId_Num";
            worksheet.Cells[1, 3].Value = "Pers_Num";

            // Adding Household members columns 
            worksheet.Cells[1, 4].Value = "Hh_Memb_Name";
            worksheet.Cells[1, 5].Value = "Hh_Memb_Relship";

            //Adding Question Parts names to columns
            foreach (var questionPart in questionParts)
            {
                //Household members
                if (questionPart.Name == "Household Members")
                    continue;

                questionColumnDict.Add(questionPart, columnNum);

                //Location Columns
                if (questionPart.Name.Contains("location"))
                {
                    //Adding Address to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Addr";
                    columnNum += 1;

                    //Adding Address to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Post_Code";
                    columnNum += 1;

                    //Adding Address to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Lat";
                    columnNum += 1;

                    //Adding Address to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Lng";

                }
                else
                {
                    worksheet.Cells[1, columnNum].Value = questionPart.Name;
                }
                columnNum += 1;
            }
            // Collecting all relevant respondents
            var Respondents_valid = surveyRespondents.Where(x => surveyResponses.Any(y => y.Respondent == x)).ToList();
            var subRespondents = Respondents_valid.SelectMany(pr => pr.SurveyRespondentGroup.GroupMembers).ToList();

            // Assign row number for each respondent
            var respondentRowNum = new Dictionary<SurveyRespondent, int>();
            var rowNum = 2;

            foreach (var respondent in subRespondents)
            {
                respondentRowNum.Add(respondent, rowNum);
                rowNum += 1;
            }
            // Place response into rows via map  
            foreach (var respondent in subRespondents)
            {
                var responses = surveyResponses.Where(r => r.Respondent == respondent).ToList();

                if (responses.Count() > 0)
                {
                    // Respondent ID (Unique)                
                    worksheet.Cells[respondentRowNum[respondent], 1].Value = (responses.Where(r => r.Respondent == respondent)
                                                                                    .Select(r => r.Respondent.Id)).First().ToString();
                    // Household ID          
                    worksheet.Cells[respondentRowNum[respondent], 2].Value = (responses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent))
                                                                                    .Select(r => r.Respondent.SurveyRespondentGroup.Id)).First().ToString();
                    //Person ID
                    worksheet.Cells[respondentRowNum[respondent], 3].Value = (responses.Where(r => r.Respondent == respondent)
                                                                                    .Select(r => r.Respondent.SurveyRespondentGroup.GroupMembers.IndexOf(respondent) + 1)).First().ToString();

                    //Household members Name
                    worksheet.Cells[respondentRowNum[respondent], 4].Value = respondent.Name;

                    //Household members Relationship
                    if (Convert.ToString(respondent.GetType()).Contains("PrimaryRespondent"))
                    {
                        worksheet.Cells[respondentRowNum[respondent], 5].Value = "Head";
                    }
                    else
                    {
                        worksheet.Cells[respondentRowNum[respondent], 5].Value = respondent.Relationship;
                    }
                }
                //Question Part Location column
                foreach (var response in responses)
                {
                    //Location column                    
                    if (response.QuestionPart.Name.Contains("location"))
                    {
                        //Address
                        locationPart = "_address";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart]].Value
                        = ReadSingleResponse(response);

                        //Postal Code
                        locationPart = "_postalCode";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart] + 1].Value
                        = ReadSingleResponse(response);

                        //Latitude
                        locationPart = "_yLatitude";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart] + 2].Value
                        = ReadSingleResponse(response);

                        //Longitude
                        locationPart = "_xLongitude";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart] + 3].Value
                        = ReadSingleResponse(response);
                    }
                    else
                    {
                        worksheet.Cells[respondentRowNum[respondent],
                                        questionColumnDict[response.QuestionPart]].Value
                            = ReadSingleResponse(response);
                    }
                }
            }
        }

        public void ResponsesPivot_HouseHold(
        List<QuestionPart> questionParts,
        List<SurveyResponse> surveyResponses,
        List<SurveyRespondent> surveyRespondents,
        ExcelWorksheet worksheet)
        {
            // process questions
            // build dictionary of questions and column numbers
            var questionColumnDict = new Dictionary<QuestionPart, int>();
            // place questions on headers and add to dictionary
            var columnNum = 3;

            // Adding Respondent ID and Household ID column name
            worksheet.Cells[1, 1].Value = "RespId_Num";
            worksheet.Cells[1, 2].Value = "HhId_Num";

            //Adding Question Parts names to columns
            foreach (var questionPart in questionParts)
            {
                //Removed Household members column
                if (questionPart.Name == "Household Members")
                    continue;

                questionColumnDict.Add(questionPart, columnNum);

                if (!questionPart.Name.Contains("location"))
                {
                    worksheet.Cells[1, columnNum].Value = questionPart.Name;
                }
                else
                {
                    //Adding Address to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Addr";
                    columnNum += 1;

                    //Adding Postal code to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Post_Code";
                    columnNum += 1;

                    //Adding Latitude to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Lat";
                    columnNum += 1;

                    //Adding Longitude to School and Work Location Questions Parts
                    worksheet.Cells[1, columnNum].Value = questionPart.Name + ": Lng";
                }
                columnNum += 1;
            }
            // assign row number for each respondent
            var respondentRowNum = new Dictionary<SurveyRespondent, int>();
            var rowNum = 2;
            foreach (var respondent in surveyRespondents)
            {
                respondentRowNum.Add(respondent, rowNum);
                rowNum += 1;
            }
            // place response into rows via map
            foreach (var respondent in surveyRespondents)
            {
                var responses = surveyResponses.Where(r => r.Respondent == respondent);

                if (responses.Count() > 0)
                {
                    // Respondent ID (Unique)                
                    worksheet.Cells[respondentRowNum[respondent], 1].Value = (surveyResponses.Where(r => r.Respondent == respondent)
                                                                                    .Select(r => r.Respondent.Id)).First().ToString();
                    // Household ID          
                    worksheet.Cells[respondentRowNum[respondent], 2].Value = (surveyResponses.Where(r => r.Respondent == respondent)
                                                                                    .Select(r => r.Respondent.SurveyRespondentGroup.Id)).First().ToString();
                }
                //Question Part Location column 
                foreach (var response in responses)
                {
                    if (!response.QuestionPart.Name.Contains("location"))
                    {
                        worksheet.Cells[respondentRowNum[respondent],
                                        questionColumnDict[response.QuestionPart]].Value
                            = ReadSingleResponse(response);
                    }
                    else
                    {
                        //Address
                        locationPart = "_address";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart]].Value
                        = ReadSingleResponse(response);

                        //Postal Code
                        locationPart = "_postalCode";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart] + 1].Value
                        = ReadSingleResponse(response);

                        //Latitide
                        locationPart = "_yLatitude";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart] + 2].Value
                        = ReadSingleResponse(response);

                        //Longitude
                        locationPart = "_xLongitude";
                        worksheet.Cells[respondentRowNum[respondent],
                                    questionColumnDict[response.QuestionPart] + 3].Value
                        = ReadSingleResponse(response);

                    }
                }
            }
        }
    }
}


