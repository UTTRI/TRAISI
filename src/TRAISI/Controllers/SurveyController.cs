﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL;
using DAL.Core.Interfaces;
using DAL.Models.Surveys;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TRAISI.Helpers;
using TRAISI.ViewModels;


namespace TRAISI.Controllers {
	[Authorize]
	[Route ("api/[controller]")]
	public class SurveyController : Controller {

		private IUnitOfWork _unitOfWork;

		public SurveyController (IUnitOfWork unitOfWork) {
			this._unitOfWork = unitOfWork;

		}

		/// <summary>
		/// Get survey by ID
		/// </summary>
		[HttpGet ("{id}")]
		[Produces (typeof (SurveyViewModel))]
		public async Task<IActionResult> GetSurvey (int id) {
			var survey = await this._unitOfWork.Surveys.GetAsync (id);
			

			return Ok(Mapper.Map<SurveyViewModel>(survey));
		}

		/// <summary>
		/// Get all surveys owned by the calling user
		/// </summary>
		[HttpGet]
		[Produces (typeof (List<SurveyViewModel>))]
		public async Task<IActionResult> GetSurveys () {

            var surveys = await this._unitOfWork.Surveys.GetAllUserSurveys(this.User.Identity.Name);
			return Ok(Mapper.Map<IEnumerable<SurveyViewModel>>(surveys));
		}
        /// <summary>
        /// Get all surveys owned for the specified group
        /// </summary>
        [HttpGet ("group/{id}")]
        [Produces(typeof(List<SurveyViewModel>))]
        public async Task<IActionResult> GetGroupSurveys(int id)
        {
            var group = this._unitOfWork.UserGroups.Get(id);
            var surveys = await this._unitOfWork.Surveys.GetAllGroupSurveys(group.Name, this.User.Identity.Name);
            return Ok(Mapper.Map<IEnumerable<SurveyViewModel>>(surveys));
        }


        /// <summary>
        /// Create survey
        /// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateSurvey ([FromBody] SurveyViewModel survey) {
			if (ModelState.IsValid) {
				if (survey == null) {
					return BadRequest ($"{nameof(survey)} cannot be null");
				}

				Survey appSurvey = Mapper.Map<Survey> (survey);
				appSurvey.Owner = this.User.Identity.Name;
				await this._unitOfWork.Surveys.AddAsync (appSurvey);
				await this._unitOfWork.SaveChangesAsync ();
				return new OkResult ();
			}

			return BadRequest (ModelState);
		}

		/// <summary>
		/// Update a survey
		/// </summary>
		[HttpPut]
		public async Task<IActionResult> UpdateSurvey ([FromBody] SurveyViewModel survey) {

            // to do: check group of input survey and ensure that user has access before updating survey

            Survey appSurvey = Mapper.Map<Survey> (survey);

			this._unitOfWork.Surveys.Update (appSurvey);
			await this._unitOfWork.SaveChangesAsync ();
			return new OkResult ();
		}

		/// <summary>
		/// Delete a survey
		/// </summary>
		[HttpDelete ("{id}")]
		public async Task<IActionResult> DeleteSurvey (int id) {
			var removed = this._unitOfWork.Surveys.Get (id);
			this._unitOfWork.Surveys.Remove (removed);
			await this._unitOfWork.SaveChangesAsync ();
			return new OkResult ();
		}

        private bool GroupValidForUser(string groupName)
        {
            return true;
        }

	}
}