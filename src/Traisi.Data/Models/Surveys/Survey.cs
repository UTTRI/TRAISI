using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Interfaces;
using Traisi.Data.Models.Questions;
using Newtonsoft.Json;

namespace Traisi.Data.Models.Surveys
{
    public class Survey : AuditableEntity, ISurvey, IEntity
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Owner { get; set; }
        public string Group { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsOpen { get; set; }
        public string SuccessLink { get; set; }
        public string RejectionLink { get; set; }
        public string DefaultLanguage { get; set; }
        public string StyleTemplate { get; set; }

        public SurveyViewCollection<SurveyView> SurveyViews { get; set; }
        public ICollection<SurveyPermission> SurveyPermissions { get; set; }
        public ICollection<Groupcode> GroupCodes { get; set; }
        public ICollection<Shortcode> Shortcodes { get; set; }

        public ICollection<ExtensionConfiguration> ExtensionConfigurations { get; set; }

        public LabelCollection<Label> TitleLabels { get; set; }

        public virtual List<SurveyLogic> SurveyLogic { get; set; }

        public List<SurveyDataTable> SurveyDataTables { get; set; }



        [NotMapped]
        public bool HasGroupCodes { get; set; }

        public Survey()
        {
            SurveyViews = new SurveyViewCollection<SurveyView>();
            ExtensionConfigurations = new List<ExtensionConfiguration>();
            SurveyLogic = new List<SurveyLogic>();
        }

        /// <summary>
        /// 
        /// </summary>
        public void PopulateDefaults()
        {
            DefaultLanguage = "en";
            TitleLabels = new LabelCollection<Label>
            {
                [DefaultLanguage] = new Label
                {
                    Value = "Default Survey Title"
                }
            };

            SurveyPermissions = new HashSet<SurveyPermission>();
            SurveyViews = new SurveyViewCollection<SurveyView>()
            {
                new SurveyView
                {
                    ViewName = "Standard",
                    Survey = this,
                    WelcomePageLabels = new LabelCollection<Label>
                    {
                        [DefaultLanguage] =
                            new Label
                            {
                                Value = null
                            }
                    },
                    ThankYouPageLabels = new LabelCollection<Label>
                    {
                        [DefaultLanguage] =
                            new Label
                            {
                                Value = null
                            }
                    },
                    TermsAndConditionsLabels = new LabelCollection<Label>
                    {
                        [DefaultLanguage] =
                            new Label
                            {
                                // language is set on the object with the helper
                                Value = null
                            }
                    },
                    ScreeningQuestionLabels = new LabelCollection<Label>
                    {
                        [DefaultLanguage] =
                            new Label
                            {
                                Value = null
                            }
                    }
                }
            };
        }
    }
}