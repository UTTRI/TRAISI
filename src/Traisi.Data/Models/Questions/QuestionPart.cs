using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.ResponseTypes;
using Traisi.Data.Models.Surveys;
using Newtonsoft.Json;

namespace Traisi.Data.Models.Questions
{

    /// <summary>
    /// 
    /// </summary>
    public class QuestionPart : IQuestionPart
    {

        public QuestionPart()
        {
            QuestionPartChildren = new HashSet<QuestionPart>();
            QuestionOptions = new HashSet<QuestionOption>();
            QuestionConfigurations = new HashSet<QuestionConfiguration>();
        }

        [JsonIgnore]
        public int Id { get; set; }
        

        public string QuestionType { get; set; }

        public string Name { get; set; }

        public ICollection<QuestionPart> QuestionPartChildren { get; set; }

        public ICollection<QuestionConfiguration> QuestionConfigurations { get; set; }

        public ICollection<QuestionOption> QuestionOptions { get; set; }

        //conditionals where this question is the source and a question option is the target
        public ICollection<QuestionOptionConditional> QuestionOptionConditionalsSource { get; set; }

        //Whether this question part is responded to by the respondent group
        public bool IsGroupQuestion { get; set; } = false;

        /// <summary>
        /// List of conditionals that exist on this question part
        /// </summary>
        /// <value></value>
        public List<SurveyLogic> Conditionals { get; set; } = new List<SurveyLogic>();

        public Survey Survey { get; set; }

        [JsonIgnore]
        public int? SurveyId { get; set; }
        /// <summary>
        /// parent reference
        /// </summary>
        /// <value></value>
        /*public QuestionPartView Parent {get;set;}

        [JsonIgnore]
        public int ParentId { get; set; }

        [JsonIgnore]
        public int ParentQuestionPartViewRef { get; set; }*/

    }
}