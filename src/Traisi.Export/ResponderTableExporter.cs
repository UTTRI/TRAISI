using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Traisi.Data;
using Traisi.Data.Models.Surveys;

namespace TRAISI.Export
{
    /// <summary>
    /// 
    /// </summary>
    internal class ResponderTableExporter
    {
        private readonly ApplicationDbContext _context;
        /// <summary>
        /// Initializer for helper object
        /// </summary>
        /// <param name="context"></param>
        /// <param name="questionTypeManager"></param>
        public ResponderTableExporter(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<SurveyRespondent> GetSurveyRespondents(Survey survey)
        {
            var primaryRespondents = _context.PrimaryRespondents.AsQueryable()
                .Where(sr => sr.Survey == survey)
                .OrderBy(sr => sr.Shortcode)
                .Include(sr => sr.SurveyRespondentGroup)
                .ThenInclude(srg => srg.GroupMembers)
                .Include(r => r.SurveyAccessRecords)
                .ToList();

            var subRespondents = primaryRespondents.SelectMany(pr => pr.SurveyRespondentGroup.GroupMembers);

            return primaryRespondents.Cast<SurveyRespondent>().ToList();
        }

        public List<PrimaryRespondent> GetPrimaryRespondents(Survey survey)
        {
            var primaryRespondents = _context.PrimaryRespondents.AsQueryable()
               .Where(sr => sr.Survey == survey)
               .OrderBy(sr => sr.Shortcode)
               .Include(sr => sr.SurveyRespondentGroup)
               .ThenInclude(srg => srg.GroupMembers)
               .Include(r => r.SurveyAccessRecords)
               .ToList();
            return primaryRespondents;
        }

        public List<SurveyRespondent> GetAllRespondents(Survey survey)
        {
            var primaryRespondents = _context.SurveyRespondents.AsQueryable()
               .Where(sr => sr.SurveyRespondentGroup.GroupPrimaryRespondent.Survey == survey)
                .OrderBy(sr => sr.SurveyRespondentGroup.Id)
               .Include(sr => sr.SurveyRespondentGroup)
               .ThenInclude(srg => srg.GroupMembers)
               .Include(r => r.SurveyRespondentGroup.GroupPrimaryRespondent)
               .ThenInclude(r => r.SurveyRespondentGroup.GroupPrimaryRespondent.SurveyAccessRecords)
               .ToList();
            return primaryRespondents;
        }
    }
}