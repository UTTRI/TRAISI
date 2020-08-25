using System;
using System.Collections.Generic;
using System.Linq;
using Traisi.Data.Models;
using Traisi.Data.Models.Surveys;
using System.IO;
using System.Threading.Tasks;

namespace Traisi.Data.Repositories.Interfaces {
    public interface ISurveyPermissionsRepository : IRepository<SurveyPermission>
    {
        Task<SurveyPermission> GetPermissionsForSurveyAsync(string userName, int surveyID);

    }
}