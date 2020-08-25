using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;

namespace Traisi.Data.Repositories {
    public class QuestionConfigurationRepository : Repository<QuestionConfiguration>, IQuestionConfigurationRepository {

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        public QuestionConfigurationRepository (ApplicationDbContext context) : base (context) { }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private ApplicationDbContext _appContext => (ApplicationDbContext) _context;

    }
}