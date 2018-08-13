using DAL.Models.Questions;
using DAL.Models.Surveys;

namespace DAL.Models.Questions
{
    /// <summary>
    /// Stores a single configuration value that belongs to a question configuration
    /// </summary>
    public interface IQuestionConfiguration 
    {

        int Id { get; set; }

        string Name { get; set; }



    }
}