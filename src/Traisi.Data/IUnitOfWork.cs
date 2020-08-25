using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;

namespace Traisi.Data
{
    public interface IUnitOfWork
    {
        ISurveyRepository Surveys { get; }
        ISurveyPermissionsRepository SurveyPermissions { get; }
        IApiKeysRepository ApiKeys { get; }
        IEmailTemplateRepository EmailTemplates { get; }
        ISiteSurveyTemplateRepository SiteSurveyTemplates { get; }
        IShortcodeRepository Shortcodes { get; }
        IGroupcodeRepository GroupCodes { get; }
        IUserGroupRepository UserGroups { get; }
        IGroupMemberRepository GroupMembers { get; }
        ISurveyViewRepository SurveyViews { get; }
        IQuestionPartRepository QuestionParts { get; }
        IQuestionPartViewRepository QuestionPartViews { get; }
        ISurveyResponseRepository SurveyResponses { get; }
        IQuestionOptionRepository QuestionOptions { get; }
        IQuestionConditionalRepository QuestionConditionals { get; }
        IQuestionOptionConditionalRepository QuestionOptionConditionals { get; }
        ISurveyRespondentRepository SurveyRespondents { get; }
        ISurveyRespondentGroupRepository SurveyRespondentGroups { get; }
        ISurveyUserRepository SurveyUsers { get; }

        IRepository<Label> Labels {get;}

        ISurveyLogicRepository SurveyLogic {get;}

        ApplicationDbContext DbContext {get;}

        int SaveChanges();
        Task<int> SaveChangesAsync();

        void EnableAutoDetectChanges();

        void DisableAutoDetectChanges();
    }
}