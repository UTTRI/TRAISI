using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Traisi.Data.Repositories
{
    public class SurveyRespondentGroupRepository : Repository<SurveyRespondentGroup>, ISurveyRespondentGroupRepository
    {
        public SurveyRespondentGroupRepository(DbContext context) : base(context)
        {
        }
    }
}