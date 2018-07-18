using System.Threading.Tasks;
using DAL.Models.Questions;
using DAL.Models.Surveys;

namespace TRAISI.Services.Interfaces
{
    public interface ISurveyViewerService
    {
        /// <summary>
        /// Retrieves a QuestionPartView at index number in the SurveyView
        /// </summary>
        /// <param name="view"></param>
        /// <param name="number"></param>
        /// <returns></returns>
        QuestionPartView GetQuestion(SurveyView view, int number);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="shortcode"></param>
        /// <returns></returns>
        bool SurveyLogin(Survey survey, string shortcode);


        Task<SurveyView> GetSurveyView(Survey survey, int viewId);


        SurveyView GetDefaultSurveyView(Survey survey);

        ///
        bool AuthorizeSurveyUser(Survey survey, string shortcode);

    }
}