using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using Traisi.Services.Interfaces;

namespace Traisi.Services
{
    /// <summary>
    /// Service for handling business logic related to respondents and the updating and querying
    /// of survey responses.
    /// </summary>
    public class SurveyRespondentService : ISurveyRespondentService
    {
        private IUnitOfWork _unitOfWork;
        public SurveyRespondentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <param name="survey"></param>
        /// <returns></returns>
        public async Task<PrimaryRespondent> CreatePrimaryRespondentForUser(ApplicationUser user, Survey survey)
        {
            var respondent = new PrimaryRespondent()
            {
                Survey = survey,
                User = user,
                SurveyAccessRecords = new List<SurveyAccessRecord>(),
                SurveyRespondentGroup = new SurveyRespondentGroup()

            };
            await this._unitOfWork.SurveyRespondents.AddAsync(respondent);
            await this._unitOfWork.SaveChangesAsync();
            respondent.SurveyRespondentGroup.GroupPrimaryRespondent = respondent;
            await this._unitOfWork.SaveChangesAsync();
            return respondent;
        }
    }
}