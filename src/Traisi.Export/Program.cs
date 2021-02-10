using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Data;
using System.Collections.Generic;
using Traisi.Data.Models.Questions;
using Traisi.Data;
using Traisi.Sdk.Services;

namespace TRAISI.Export
{
    public class Program
    {

        public static int Main(string[] args)
        {
            // connect to the database
            var contextFactory = new DesignTimeDbContextFactory();
            var context = contextFactory.CreateDbContext(args);
            var questionTypeManager = new QuestionTypeManager(null, new NullLoggerFactory());
            questionTypeManager.LoadQuestionExtensions("../TRAISI/extensions");
            var questionExporter = new QuestionTableExporter(context, questionTypeManager);
            var responseTableExporter = new ResponseTableExporter(context, questionTypeManager);
            var responderTableExporter = new ResponderTableExporter(context);

            if (args.Length < 1)
            {
                Console.Error.WriteLine("Please specify the survey code as an input argument.");
                return 1;
            }

            // Read survey name
            var survey = context.Surveys
            .AsQueryable()
            .Where(s => string.Equals(s.Code, args[0]))
            .Include(s => s.SurveyViews)
            .ThenInclude(v => v.QuestionPartViews)
            .FirstOrDefault();

            if (survey == null)
            {
                Console.Error.WriteLine($"Survey with code {args[0]} does not exist. Exiting.");
                return 1;
            }

            Console.WriteLine("Gathering Questions");
            var view = survey.SurveyViews.FirstOrDefault();
            if (view == null)
            {
                Console.Error.WriteLine($"Survey has no views or data. Exiting.");
                return 1;
            }

            List<QuestionPartView> householdQuestions = new List<QuestionPartView>();
            List<QuestionPartView> personQuestions = new List<QuestionPartView>();
            List<QuestionPartView> questionPartViews = new List<QuestionPartView>();

            foreach (var page in view.QuestionPartViews)
            {
                context.Entry(page).Collection(c => c.QuestionPartViewChildren).Load();
                context.Entry(page).Reference(r => r.QuestionPart).Load();
                foreach (var q in page.QuestionPartViewChildren)
                {
                    context.Entry(q).Collection(c => c.Labels).Load();
                    context.Entry(q).Reference(r => r.QuestionPart).Load();
                    context.Entry(q).Collection(c => c.QuestionPartViewChildren).Load();

                    bool isHousehold = false;
                    if (q.QuestionPart != null)
                    {                        
                        context.Entry(q.QuestionPart).Collection(c => c.QuestionOptions).Load();
                        context.Entry(q.QuestionPart).Collection(c => c.QuestionConfigurations).Load();
                        foreach (var option in q.QuestionPart.QuestionOptions)
                        {
                            context.Entry(option).Collection(option => option.QuestionOptionLabels).Load();
                        }
                        questionPartViews.Add(q);
                        householdQuestions.Add(q);
                    }
                    else if (q.IsHousehold)
                    {
                        isHousehold = true;
                    }

                    foreach (var q2 in q.QuestionPartViewChildren)
                    {
                        context.Entry(q2).Collection(c => c.Labels).Load();
                        context.Entry(q2).Reference(r => r.QuestionPart).Load();
                        context.Entry(q2.QuestionPart).Collection(c => c.QuestionOptions).Load();
                        context.Entry(q2.QuestionPart).Collection(c => c.QuestionConfigurations).Load();
                        context.Entry(q2).Collection(c => c.QuestionPartViewChildren).Load();
                        foreach (var option in q2.QuestionPart.QuestionOptions)
                        {
                            context.Entry(option).Collection(option => option.QuestionOptionLabels).Load();
                        }
                        questionPartViews.Add(q2);

                        if (!isHousehold)
                        {
                            householdQuestions.Add(q2);
                        }
                        else
                        {
                            personQuestions.Add(q2);
                        }
                    }
                }
                continue;
            }

            Console.WriteLine("Getting Responses");
            var responses = responseTableExporter.ResponseList(questionPartViews);
            Console.WriteLine("Finding Respondents");
            var respondents = responderTableExporter.GetSurveyRespondents(survey);
            var allSurveyRespondents = responderTableExporter.GetAllRespondents(survey);
            var questionParts = questionPartViews.Select(qpv => qpv.QuestionPart).ToList();

            // Separating Personal and Household questions    
            var questionPartViews_personal = personQuestions.ToList();
            var questionPartViews_houseHold = householdQuestions.ToList();

            var responses_personal = responses.Where(res => questionPartViews_personal.Select(x => x.QuestionPart).Contains(res.QuestionPart)).ToList();
            var responses_houseHold = responses.Where(res => questionPartViews_houseHold.Select(x => x.QuestionPart).Contains(res.QuestionPart)).ToList();

            var questionParts_personal = questionPartViews_personal.Select(x => x.QuestionPart).ToList();
            var questionParts_houseHold = questionPartViews_houseHold.Select(x => x.QuestionPart).ToList();

            // Household Questions Excel file
            var hfi = new FileInfo(@"..\..\src\TRAISI.Export\surveyexportfiles\HouseholdQuestions.xlsx");
            if (hfi.Exists)
            {
                hfi.Delete();
            }
            using (var eXp = new ExcelPackage(hfi))
            {
                // initalize a sheet in the workbook
                var workbook = eXp.Workbook;
                Console.WriteLine("Writing Household Question sheet");
                var hhQuestionsSheet = workbook.Worksheets.Add("Household Questions");
                questionExporter.BuildQuestionTable(questionPartViews_houseHold, hhQuestionsSheet);
                Console.WriteLine("Writing Household Response sheet");
                var hhResponseSheet = workbook.Worksheets.Add("Household Responses");
                responseTableExporter.ResponseListToWorksheet(responses_houseHold, hhResponseSheet, true);
                Console.WriteLine("Writing Household Response Pivot sheet");
                var hhResponsePivotSheet = workbook.Worksheets.Add("Household Responses Pivot");
                responseTableExporter.ResponsesPivot_HouseHold(questionParts_houseHold, responses_houseHold, respondents, hhResponsePivotSheet);
                eXp.Save();
            }

            // Personal Questions Excel file
            var pfi = new FileInfo(@"..\..\src\TRAISI.Export\surveyexportfiles\PersonalQuestions.xlsx");
            if (pfi.Exists)
            {
                pfi.Delete();
            }
            using (var eXp = new ExcelPackage(pfi))
            {
                // initalize a sheet in the workbook
                var workbook = eXp.Workbook;
                Console.WriteLine("Writing Personal Question sheet");
                var pQuestionsSheet = workbook.Worksheets.Add("Personal Questions");
                questionExporter.BuildQuestionTable(questionPartViews_personal, pQuestionsSheet);
                Console.WriteLine("Writing Personal Response sheet");
                var pResponseSheet = workbook.Worksheets.Add("Personal Responses");
                responseTableExporter.ResponseListToWorksheet(responses_personal, pResponseSheet, false);
                Console.WriteLine("Writing Personal Response Pivot sheet");
                var pResponsePivotSheet = workbook.Worksheets.Add("Personal Responses Pivot");
                responseTableExporter.ResponsesPivot_Personal(questionParts_personal, responses_personal, respondents, pResponsePivotSheet);
                eXp.Save();
            }

            // Travel Diary Excel file
            var tfi = new FileInfo(@"..\..\src\TRAISI.Export\surveyexportfiles\TravelDiary.xlsx");
            if (tfi.Exists)
            {
                tfi.Delete();
            }
            using (var eXp = new ExcelPackage(tfi))
            {
                // initalize a sheet in the workbook
                var workbook = eXp.Workbook;
                Console.WriteLine("Writing Travel Diary Response sheet");
                var travelDiarySheet = workbook.Worksheets.Add("Travel Diary Responses");
                responseTableExporter.ResponsesPivot_TravelDiary(questionParts_personal, responses_personal, allSurveyRespondents, travelDiarySheet);
                Console.WriteLine("Writing One Location Travel Diary Response sheet");
                var oneLocationTravelDiarySheet = workbook.Worksheets.Add("One Location Diary Responses");
                responseTableExporter.ResponsesPivot_OneLocationTravelDiary(questionParts_personal, responses_personal, allSurveyRespondents, oneLocationTravelDiarySheet);
                eXp.Save();
            }
            // Transit Routes Excel file
            var rfi = new FileInfo(@"..\..\src\TRAISI.Export\surveyexportfiles\TransitRoutes.xlsx");
            if (rfi.Exists)
            {
                rfi.Delete();
            }
            using (var eXp = new ExcelPackage(rfi))
            {
                // initalize a sheet in the workbook
                var workbook = eXp.Workbook;
                Console.WriteLine("Writing Transit Routes Response sheet");
                var transitRoutesSheet = workbook.Worksheets.Add("Transit Routes Responses");
                responseTableExporter.ResponsesPivot_TransitRoutes(questionParts_personal, responses_personal, respondents, transitRoutesSheet);
                Console.WriteLine("Writing Not In List Routes Response sheet");
                var notInListTransitRoutesSheet = workbook.Worksheets.Add("Not In List Responses");
                responseTableExporter.ResponsesPivot_NotInListTransitRoutes(questionParts_personal, responses_personal, respondents, notInListTransitRoutesSheet);
                eXp.Save();
            }
            return 0;
        }

    }
}