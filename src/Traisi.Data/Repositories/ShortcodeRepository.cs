using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Traisi.Data.Repositories {
	public class ShortcodeRepository : Repository<Shortcode>, IShortcodeRepository {
		public ShortcodeRepository (ApplicationDbContext context) : base (context) { }

		public ShortcodeRepository (DbContext context) : base (context) { }

		private ApplicationDbContext _appContext => (ApplicationDbContext) _context;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="surveyId"></param>
		/// <param name="isTest"></param>
		/// <param name="pageIndex"></param>
		/// <param name="pageSize"></param>
		/// <returns></returns>
		public async Task<IEnumerable<Shortcode>> GetShortcodesForSurveyAsync (int surveyId, bool isTest, int pageIndex, int pageSize) {
			IQueryable<Shortcode> codes = _appContext.Shortcodes
				.Where (s => s.Survey.Id == surveyId && s.IsTest == isTest)
				.OrderByDescending (sc => sc.CreatedDate);

			if (pageIndex > 0) {
				codes = codes.Skip (pageIndex * pageSize);
			}
			if (pageSize > 0) {
				codes = codes.Take (pageSize);
			}
			return await codes.ToListAsync ();
		}

		/// <summary>
		/// Get all shortcodes for survey
		/// </summary>
		/// <param name="surveyId"></param>
		/// <param name="isTest"></param>
		/// <returns></returns>
		public IEnumerable<Shortcode> GetShortcodesForSurvey (int surveyId, bool isTest) {
			return _appContext.Shortcodes
				.Where (s => s.Survey.Id == surveyId && s.IsTest == isTest)
				.OrderByDescending (sc => sc.CreatedDate)
				.ToList ();
		}

		public IEnumerable<Shortcode> GetIndividualShortcodesForSurvey (int surveyId) {
			return _appContext.Shortcodes
				.Where (s => s.Survey.Id == surveyId && s.Groupcode == null);
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="survey"></param>
		/// <param name="code"></param>
		/// <returns></returns>
		public async Task<Shortcode> GetShortcodeForSurveyAsync (Survey survey, string code) {
			return await _appContext.Shortcodes
				.Where (s => s.Survey == survey && s.Code == code).FirstOrDefaultAsync ();
		}

		public async Task<int> GetCountOfShortcodesForSurveyAsync (int surveyId, bool isTest) {
			return await _appContext.Shortcodes
				.Where (s => s.Survey.Id == surveyId && s.IsTest == isTest)
				.CountAsync ();
		}

		/// <summary>
		/// Check if shortcode in given survey is unique
		/// </summary>
		/// <param name="surveyId"></param>
		/// <param name="code"></param>
		/// <returns></returns>
		public bool UniqueShortCodeForSurvey (int surveyId, string code) {
			return !_appContext.Shortcodes
				.Any (s => s.Survey.Id == surveyId && s.Code == code);
		}

		public IEnumerable<string> GetUniqueCodes (int surveyId, IEnumerable<string> codesToCheck) {
			return codesToCheck
				.Except (_appContext.Shortcodes.Where (s => s.Survey.Id == surveyId).Select (s => s.Code))
				.ToList ();
		} 

		/// <summary>
		/// 
		/// </summary>
		/// <param name="survey"></param>
		/// <returns></returns>
		public async Task RemoveAllInvividualCodesForSurveyAsync (Survey survey) {

			this._appContext.RemoveRange (this.GetIndividualShortcodesForSurvey (survey.Id));
			await this._appContext.SaveChangesAsync ();

			return;
		}

	}
}