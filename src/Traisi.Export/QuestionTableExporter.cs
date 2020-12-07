using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Web;
using HtmlAgilityPack;
using System.Data;
using Traisi.Data.Models.Questions;
using Traisi.Data;
using Traisi.Sdk.Services;

namespace TRAISI.Export
{
    internal class QuestionTableExporter
    {
        private readonly ApplicationDbContext _context;
        private readonly QuestionTypeManager _questionTypeManager;

        /// <summary>
        /// Initializer for helper object
        /// </summary>
        /// <param name="context"></param>
        /// <param name="questionTypeManager"></param>
        public QuestionTableExporter(ApplicationDbContext context, QuestionTypeManager questionTypeManager)
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

        /// <summary>
        /// This function returns all of the child questionPartViews that is only one question
        /// for a QuestionPartView as a flat list
        /// </summary>
        /// <param name="questionPartView"></param>
        /// <returns>Ordered flat list of child question part views</returns>
        public async Task<List<QuestionPartView>> QuestionPartsList(QuestionPartView questionPartView)
        {
            // don't look at child part views if there's a QuestionPart
            if (questionPartView.QuestionPart != null)
            {
                return new List<QuestionPartView>() { questionPartView };
            }

            var questionPartViewChildren = await _context.QuestionPartViews.AsQueryable()
                .Where(qp => qp.ParentView == questionPartView)
                .Include(qpv => qpv.QuestionPart)
                .Include(qpv => qpv.QuestionPart.QuestionOptions)
                .Include(qpv => qpv.QuestionPart.QuestionConfigurations)
                .Include(qpv => qpv.QuestionPart)
                .ThenInclude(qp => qp.QuestionOptions)
                .ThenInclude(qo => qo.QuestionOptionLabels)
                .OrderBy(p => p.Order)
                .ToListAsync();

            var questionsTasks = questionPartViewChildren.Select(QuestionPartsList).ToList();
            await Task.WhenAll(questionsTasks);
            var questions = questionsTasks.Select(t => t.Result).SelectMany(nr => nr).ToList();

            return questions;
        }

        /// <summary>
        /// fills a excel work sheet with questions and their options
        /// </summary>
        /// <param name="questionPartViews"></param>
        /// <param name="worksheet"></param>
        public void BuildQuestionTable(IList<QuestionPartView> questionPartViews, ExcelWorksheet worksheet)
        {
            //Removed Travel diary and Transit routes questions.
            questionPartViews = questionPartViews.Where(res => res.QuestionPart.Name != "Travel diary" && res.QuestionPart.Name != "Transit routes").ToList();                                                    
            
            // inject header
            var headerRow = new List<string[]>()
            {
                new string[] { "Question Name", "Question Text", "Type", "Option Code / Name", "Option Text / Value" }
            };
            worksheet.Cells["A1:E1"].LoadFromArrays(headerRow);
            worksheet.Cells["A1:E1"].Style.Font.Bold = true;

            // Loop over each question
            var currentRow = 2;
            foreach (var questionPartView in questionPartViews)
            {
                var questionPart = questionPartView.QuestionPart;

                // read question options or configs if options don't exist
                var orderedOptions = questionPart.QuestionOptions.OrderBy(o => o.Order).ToList();
                var numOptions = orderedOptions.Count();
                var orderedConfigs = questionPart.QuestionConfigurations.OrderBy(o => o.Name).ToList();
                var numConfig = orderedConfigs.Count();
                IEnumerable<string> optionCodes = new List<string>();
                IEnumerable<string> optionLabels = new List<string>();
                int bottomRow;

                if (numOptions > 0)
                {
                    optionCodes = orderedOptions.Select(o => o.Code);
                    optionLabels = orderedOptions
                        .SelectMany(o => o.QuestionOptionLabels.Where(label => label.Language == "en"))
                        .Select(label => label.Value);
                    bottomRow = currentRow + numOptions - 1;
                }
                else if (numConfig > 0)
                {
                    optionCodes = orderedConfigs.Select(c => c.Name);
                    optionLabels = orderedConfigs.Select(c => c.Value);
                    bottomRow = currentRow + numConfig - 1;
                    numOptions = numConfig;
                }
                else
                {
                    bottomRow = currentRow;
                }
                // Question Name
                worksheet.Cells[currentRow, 1].Value = questionPart.Name;
                if (numOptions > 0)
                {
                    worksheet.Cells[currentRow, 1, bottomRow, 1].Merge = true;
                    worksheet.Cells.Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                }
                // Question Text
                worksheet.Cells[currentRow, 2].Value =
                    StripHtmlTags(questionPartView.Labels["en"].Value);
                if (numOptions > 0)
                {
                    worksheet.Cells[currentRow, 2, bottomRow, 2].Merge = true;
                    worksheet.Cells.Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                }
                // Question Type
                worksheet.Cells[currentRow, 3].Value = questionPart.QuestionType;
                if (numOptions > 0)
                {
                    worksheet.Cells[currentRow, 3, bottomRow, 3].Merge = true;
                    worksheet.Cells.Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                }
                // Loop over options
                if (numOptions > 0)
                {
                    using (var codes = optionCodes.GetEnumerator())
                    using (var labels = optionLabels.GetEnumerator())
                    {
                        while (codes.MoveNext() && labels.MoveNext())
                        {
                            // Option Code
                            if (int.TryParse(codes.Current, out var codeNum))
                            {
                                worksheet.Cells[currentRow, 4].Value = codeNum;
                                worksheet.Cells.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                            }
                            else
                            {
                                worksheet.Cells[currentRow, 4].Value = codes.Current;
                                worksheet.Cells.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                            }
                            // Option Text
                            worksheet.Cells[currentRow, 5].Value = labels.Current;
                            currentRow++;
                        }
                    }
                }
                currentRow = bottomRow + 1;
            }
        }

        private static string StripHtmlTags(string html)
        {
            if (string.IsNullOrEmpty(html)) return "";
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            return HttpUtility.HtmlDecode(doc.DocumentNode.InnerText);
        }
    }
}