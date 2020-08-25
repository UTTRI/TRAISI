using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories;
using Traisi.Data.Repositories.Interfaces;

namespace Traisi.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        readonly ApplicationDbContext _context;

        ISurveyRepository _surveys;
        ISurveyPermissionsRepository _surveyPermissions;
        IUserGroupRepository _userGroups;
        IGroupMemberRepository _groupMembers;
        IApiKeysRepository _apiKeys;
        IEmailTemplateRepository _emailTemplates;
        ISiteSurveyTemplateRepository _siteSurveyTemplates;
        IShortcodeRepository _shortcodes;
        IGroupcodeRepository _groupCodes;
        ISurveyViewRepository _surveyViews;
        IQuestionPartRepository _questionParts;
        IQuestionPartViewRepository _questionPartViews;
        ISurveyResponseRepository _surveyResponses;
        IQuestionOptionRepository _questionOptions;
        IQuestionConditionalRepository _questionConditionals;

        IQuestionOptionConditionalRepository _questionOptionConditionals;

        ISurveyRespondentGroupRepository _suveyRespondentGroupRepository;

        ISurveyRespondentRepository _surveyRespondentRepository;

        ISurveyUserRepository _surveyUserRepository;

        ISurveyLogicRepository _surveyLogicRepository;

        IRepository<Label> _labelRepository;

        public ApplicationDbContext DbContext => _context;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="surveyRepository"></param>
        public UnitOfWork(ISurveyRepository surveyRepository)
        {
            this._surveys = surveyRepository;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 
        /// </summary>
        public IQuestionOptionRepository QuestionOptions
        {
            get
            {
                if (_questionOptions == null)
                {
                    _questionOptions = new QuestionOptionRepository(_context);
                }

                return _questionOptions;
            }
        }

        public ISurveyResponseRepository SurveyResponses
        {
            get
            {
                if (_surveyResponses == null)
                {
                    _surveyResponses = new SurveyResponseRepository(_context);
                }

                return _surveyResponses;
            }
        }

        public ISurveyViewRepository SurveyViews
        {
            get
            {
                if (_surveyViews == null)
                {
                    _surveyViews = new SurveyViewRepository(_context);
                }

                return _surveyViews;
            }
        }

        public ISurveyRepository Surveys
        {
            get
            {
                if (_surveys == null)
                    _surveys = new SurveyRepository(_context);

                return _surveys;
            }
        }

        public ISurveyPermissionsRepository SurveyPermissions
        {
            get
            {
                if (_surveyPermissions == null)
                    _surveyPermissions = new SurveyPermissionsRepository(_context);

                return _surveyPermissions;
            }
        }

        public IGroupMemberRepository GroupMembers
        {
            get
            {
                if (_groupMembers == null)
                    _groupMembers = new GroupMemberRepository(_context);

                return _groupMembers;
            }
        }

        public IUserGroupRepository UserGroups
        {
            get
            {
                if (_userGroups == null)
                    _userGroups = new UserGroupRepository(_context);

                return _userGroups;
            }
        }

        public IApiKeysRepository ApiKeys
        {
            get
            {
                if (_apiKeys == null)
                    _apiKeys = new ApiKeysRepository(_context);

                return _apiKeys;
            }
        }

        public IEmailTemplateRepository EmailTemplates
        {
            get
            {
                if (_emailTemplates == null)
                    _emailTemplates = new EmailTemplatesRepository(_context);

                return _emailTemplates;
            }
        }

        public ISiteSurveyTemplateRepository SiteSurveyTemplates
        {
            get
            {
                if (_siteSurveyTemplates == null)
                    _siteSurveyTemplates = new SiteSurveyTemplateRepository(_context);

                return _siteSurveyTemplates;
            }
        }

        public IShortcodeRepository Shortcodes
        {
            get
            {
                if (_shortcodes == null)
                    _shortcodes = new ShortcodeRepository(_context);

                return _shortcodes;
            }
        }

        public IGroupcodeRepository GroupCodes
        {
            get
            {
                if (_groupCodes == null)
                {
                    _groupCodes = new GroupcodeRepository(_context);
                }

                return _groupCodes;
            }
        }

        public IQuestionPartRepository QuestionParts
        {
            get
            {
                if (_questionParts == null)
                {
                    _questionParts = new QuestionPartRepository(_context);
                }

                return _questionParts;
            }
        }

        public IQuestionPartViewRepository QuestionPartViews
        {
            get
            {
                if (_questionPartViews == null)
                {
                    _questionPartViews = new QuestionPartViewRepository(_context);
                }

                return _questionPartViews;
            }
        }

        public IQuestionConditionalRepository QuestionConditionals
        {
            get
            {
                if (_questionConditionals == null)
                {
                    _questionConditionals = new QuestionConditionalRepository(_context);
                }
                return _questionConditionals;
            }
        }

        public IQuestionOptionConditionalRepository QuestionOptionConditionals
        {
            get
            {
                if (_questionOptionConditionals == null)
                {
                    _questionOptionConditionals = new QuestionOptionConditionalRepository(_context);
                }
                return _questionOptionConditionals;
            }
        }

        

        public ISurveyRespondentRepository SurveyRespondents
        {
            get
            {
                if (_surveyRespondentRepository == null)
                {
                    _surveyRespondentRepository = new SurveyRespondentRepository(_context);
                }

                return _surveyRespondentRepository;
            }
        }

        public ISurveyRespondentGroupRepository SurveyRespondentGroups
        {
            get
            {

                if (_suveyRespondentGroupRepository == null)
                {
                    _suveyRespondentGroupRepository = new SurveyRespondentGroupRepository(_context);
                }

                return _suveyRespondentGroupRepository;
            }
        }

        public ISurveyUserRepository SurveyUsers
        {
            get
            {

                if (_suveyRespondentGroupRepository == null)
                {
                    _surveyUserRepository = new SurveyUserRepository(_context);
                }

                return _surveyUserRepository;
            }
        }

       

        public ISurveyLogicRepository SurveyLogic
        {
            get
            {

                if (_surveyLogicRepository == null)
                {
                    _surveyLogicRepository = new SurveyLogicRepository(_context);
                }

                return _surveyLogicRepository;
            }
        }

        public IRepository<Label> Labels
        {
            get
            {

                if (_surveyLogicRepository == null)
                {
                    _labelRepository = new Repository<Label>(_context);
                }

                return _labelRepository;
            }
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void EnableAutoDetectChanges()
        {
            this._context.ChangeTracker.AutoDetectChangesEnabled = true;
        }

        public void DisableAutoDetectChanges()
        {
            this._context.ChangeTracker.AutoDetectChangesEnabled = false;
        }
    }
}