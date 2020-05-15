using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using TRAISI.Helpers;
using TRAISI.SDK.Enums;
using System.Text.Json;
using System.Threading.Tasks;
using System.Data;
using System.Runtime;
using System.Text.RegularExpressions;
using TRAISI.Data.Models.Surveys;
using TRAISI.Data;
using TRAISI.Data.Models.ResponseTypes;
using TRAISI.Data.Models.Questions;
using Newtonsoft.Json.Linq;

namespace TRAISI.Export
{
    public class ResponseTableExporter
    {
        private readonly ApplicationDbContext _context;
        private readonly QuestionTypeManager _questionTypeManager;
        String locationPart = "";

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
                case QuestionResponseType.Decimal:
                    return ((DecimalResponse)surveyResponse.ResponseValues.First()).Value;
                case QuestionResponseType.Integer:
                    return ((IntegerResponse)surveyResponse.ResponseValues.First()).Value;
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
                    return ((OptionSelectResponse)surveyResponse.ResponseValues.First()).Value;
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

        private List<Tuple<string, string>> ReadJsonResponse_Mode(SurveyResponse response)
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

        private string ReadSplitLocation(ISurveyResponse surveyResponse, String locationPart)
        {
            string value = String.Empty;

            switch (locationPart)
            {
                case "_address":
                    string addressWithPostalCode = (((LocationResponse)surveyResponse.ResponseValues.First()).Address).ToString();
                    value = addressWithPostalCode.Substring(0, addressWithPostalCode.Length - 6);
                    value = value.TrimEnd(new char[] { ',', ' ' });
                    return value;

                case "_postalCode":
                    string addressWithPostalCode1 = (((LocationResponse)surveyResponse.ResponseValues.First()).Address).ToString();
                    value = addressWithPostalCode1.Substring(addressWithPostalCode1.Length - 6);
                    return value;

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
                "Trip_Day_Ext", "Trip_Start_Time_Ext", "Arr_Date", "Arr_Day", "Arr_Time", "Trip_Modes",
                "Trip_Num_Unique_Modes", "Sing_Trip_Diary_Flag", "Incomp_Diary" }
            };
            worksheet.Cells["A1:BC1"].LoadFromArrays(headerRow);
            worksheet.Cells["A1:BC1"].Style.Font.Bold = true;

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
                    string value = String.Empty;
                    string addressWithPostalCode = response.Address.ToString();
                    value = addressWithPostalCode.Substring(0, addressWithPostalCode.Length - 6);
                    value = value.TrimEnd(new char[] { ',', ' ' });
                    worksheet.Cells[rowNumber, 10].Value = value;

                    //Postalcode Origin
                    value = addressWithPostalCode.Substring(addressWithPostalCode.Length - 6);
                    worksheet.Cells[rowNumber, 11].Value = value;

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
                    string value_Dest = String.Empty;
                    string addressWithPostalCode_Dest = response_dest.Address.ToString();
                    value_Dest = addressWithPostalCode_Dest.Substring(0, addressWithPostalCode_Dest.Length - 6);
                    value_Dest = value_Dest.TrimEnd(new char[] { ',', ' ' });
                    worksheet.Cells[rowNumber, 22].Value = value_Dest;

                    //Postalcode Destination
                    value_Dest = addressWithPostalCode_Dest.Substring(addressWithPostalCode_Dest.Length - 6);
                    worksheet.Cells[rowNumber, 23].Value = value_Dest;

                    //CmpMultiModeCatkey 
                    worksheet.Cells[rowNumber, 24].Value = String.Empty;

                    //Mode Details
                    if (modeDetails.Count >= locNumber)
                    {
                        //CmpMultiModeCatName 
                        worksheet.Cells[rowNumber, 30].Value = modeDetails[locNumber - 1].Item2;

                        //CmpMultiModeCatMainGroup
                        worksheet.Cells[rowNumber, 31].Value = modeDetails[locNumber - 1].Item1;
                    }
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
                    string timeA = response.TimeA.ToString();
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
                    string timeB = response.TimeB.ToString();
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

                }
            }
        }

        public void ResponsesPivot_TransitRoutes(
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
                new string[] { "RespId_Num", "HhId_Num", "Pers_Num", "Trip_Num", "Mode_Accs", "Utmx_Accs",
                "Utmy_Accs", "Gta06_Accs", "Pd_Accs", "Region_Accs", "Mode_Egrs", "Utmx_Egrs", "Utmy_Egrs",
                "Gta06_Egrs", "Pd_Egrs", "Region_Egrs", "Route_1", "Route_2", "Route_3", "Route_4",
                "Route_5", "Route_6", "N_Route", "Last_Route", "Sub_On", "Sub_Off", "Go_On", "Go_Off",
                "Accs_M", "Accs_M_Man", "Egrs_M", "Egrs_M_Man", "N_Go_Rail", "N_Go_Bus", "N_Subway",
                "N_Ttc_Bus", "N_Local", "N_Other", "Oper_code", "Use_Ttc" }
            };
            worksheet.Cells["A1:AN1"].LoadFromArrays(headerRow);
            worksheet.Cells["A1:AN1"].Style.Font.Bold = true;

            // Collecting all relevant respondents
            var Respondents_valid = surveyRespondents.Where(x => surveyResponses.Any(y => y.Respondent == x)).ToList();
            var subRespondents = Respondents_valid.SelectMany(pr => pr.SurveyRespondentGroup.GroupMembers).ToList();

            int rowNumber = 1;

            foreach (var respondent in subRespondents)
            {
                int trpNumber = 0;

                var responses = surveyResponses.Where(r => r.Respondent.SurveyRespondentGroup.GroupMembers.Any(y => y == respondent)).ToList();

                rowNumber++;
                trpNumber++;

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
                worksheet.Cells[rowNumber, 5].Value = String.Empty;

                //Utmx_Accs
                worksheet.Cells[rowNumber, 6].Value = String.Empty;

                //Utmy_Accs
                worksheet.Cells[rowNumber, 7].Value = String.Empty;

                //Gta06_Accs
                worksheet.Cells[rowNumber, 8].Value = String.Empty;

                //Pd_Accs
                worksheet.Cells[rowNumber, 9].Value = String.Empty;

                //Mode_Egrs
                worksheet.Cells[rowNumber, 10].Value = String.Empty;

                //Utmx_Egrs
                worksheet.Cells[rowNumber, 11].Value = String.Empty;

                //Utmy_Egrs
                worksheet.Cells[rowNumber, 12].Value = String.Empty;

                //Gta06_Egrs
                worksheet.Cells[rowNumber, 13].Value = String.Empty;

                //Pd_Egrs
                worksheet.Cells[rowNumber, 14].Value = String.Empty;

                //Region_Egrs
                worksheet.Cells[rowNumber, 15].Value = String.Empty;

                //Route_1
                worksheet.Cells[rowNumber, 16].Value = String.Empty;

                //Route_2
                worksheet.Cells[rowNumber, 17].Value = String.Empty;

                //Route_3
                worksheet.Cells[rowNumber, 18].Value = String.Empty;

                //Route_4
                worksheet.Cells[rowNumber, 19].Value = String.Empty;

                //Route_5
                worksheet.Cells[rowNumber, 20].Value = String.Empty;

                //Route_6
                worksheet.Cells[rowNumber, 21].Value = String.Empty;

                //N_Route
                worksheet.Cells[rowNumber, 22].Value = String.Empty;

                //Last_Route
                worksheet.Cells[rowNumber, 23].Value = String.Empty;

                //Sub_On
                worksheet.Cells[rowNumber, 24].Value = String.Empty;

                //Sub_Off
                worksheet.Cells[rowNumber, 25].Value = String.Empty;

                //Go_On                    
                worksheet.Cells[rowNumber, 26].Value = String.Empty;

                //Go_Off
                worksheet.Cells[rowNumber, 27].Value = String.Empty;

                //Accs_M
                worksheet.Cells[rowNumber, 28].Value = String.Empty;

                //Accs_M_Man
                worksheet.Cells[rowNumber, 29].Value = String.Empty;

                //Egrs_M
                worksheet.Cells[rowNumber, 30].Value = String.Empty;

                //Egrs_M_Man
                worksheet.Cells[rowNumber, 31].Value = String.Empty;

                //N_Go_Rail
                worksheet.Cells[rowNumber, 32].Value = String.Empty;

                //N_Go_Bus
                worksheet.Cells[rowNumber, 33].Value = String.Empty;

                //N_Subway
                worksheet.Cells[rowNumber, 34].Value = String.Empty;

                //N_Ttc_Bus
                worksheet.Cells[rowNumber, 35].Value = String.Empty;

                //N_Local
                worksheet.Cells[rowNumber, 36].Value = String.Empty;

                //N_Other
                worksheet.Cells[rowNumber, 37].Value = String.Empty;

                //Oper_code
                worksheet.Cells[rowNumber, 38].Value = String.Empty;

                //Use_Ttc
                worksheet.Cells[rowNumber, 39].Value = String.Empty;

            }
        }

        public void ResponseListToWorksheet(List<SurveyResponse> surveyResponses, ExcelWorksheet worksheet, Boolean isHouseHold)
        {
            //Removed Timeline and Travel modes responses. 
            surveyResponses = surveyResponses.Where(res => res.QuestionPart.Name != "Timeline" && res.QuestionPart.Name != "Travel modes").OrderBy(res => res.Respondent.Id).ToList();

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
            //Removed Travel modes and Timeline columns
            surveyResponses = surveyResponses.Where(res => res.QuestionPart.Name != "Timeline" && res.QuestionPart.Name != "Travel modes").ToList();
            questionParts = questionParts.Where(res => res.Name != "Timeline" && res.Name != "Travel modes").ToList();

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
                if (questionPart.Name == "Household members")
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
                if (questionPart.Name == "Household members")
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

