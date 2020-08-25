using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;

namespace Traisi.Data.Models.Questions
{
    public interface IQuestionPart
    {

        /// <summary>
        /// 
        /// </summary>
        int Id { get; set; }

        /// <summary>
        /// 
        /// </summary>
        string QuestionType { get; set; }
        
        /// <summary>
        /// The name, or shortform slug that identifies / references this question.
        /// </summary>
        string Name { get; set; }


        /// <summary>
        /// 
        /// </summary>
        ICollection<QuestionPart> QuestionPartChildren { get; set; }


        /// <summary>
        /// 
        /// </summary>
        ICollection<QuestionConfiguration> QuestionConfigurations { get; set; }

        /// <summary>
        /// 
        /// </summary>
        ICollection<QuestionOption> QuestionOptions { get; set; }

        /// <summary>
        /// 
        /// </summary>
        bool IsGroupQuestion { get; set; }

    }
}