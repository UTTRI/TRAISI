using System.Collections.Generic;
using DAL.Models.Questions;
using DAL.Models.Surveys;
using TRAISI.SDK;

namespace TRAISI.Services.Interfaces
{
    public interface ISurveyBuilderService
    {

        SurveyView AddSurveyView(Survey survey, string viewName);

        void RemoveSurveyView(Survey survey, int id);

        QuestionConfiguration SetQuestionConfiguration(QuestionPart questionPart, string name, string value);

        void SetQuestionOption(QuestionPart questionPart, string name, string value, string language);

        void AddQuestionOption(QuestionPart questionPart, string name, string value, string language);

        void RemoveQuestionConfiguration(QuestionPart questionPart, string name);

        void RemoveQuestionOption(QuestionPart questionPart, string name, string language);

        QuestionPartView AddQuestionPart(SurveyView view, QuestionPart part, QuestionTypeDefinition definition, int position);

        void AddQuestionPartChild(QuestionPart part, QuestionTypeDefinition definition, int slot);

        void SetSurveyTitle(Survey s, string title, string language);

        IEnumerable<QuestionConfiguration> GetQuestionConfigurations(QuestionPart questionPart);

        IEnumerable<QuestionOption> GetQuestionOptions(QuestionPart questionPart, string language);
    }
}