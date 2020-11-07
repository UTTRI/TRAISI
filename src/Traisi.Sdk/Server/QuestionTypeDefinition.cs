using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Library.ResponseTypes;

namespace Traisi.Sdk
{
    /// <summary>
    /// Contains the definition for a specific question type - path location and other meta info.
    /// </summary>
    public class QuestionTypeDefinition
    {

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string TypeName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public DirectoryInfo Location { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <value></value>
        public QuestionHook Hook { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public Dictionary<string, QuestionOptionDefinition> QuestionOptions { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public Dictionary<string, QuestionConfigurationDefinition> QuestionConfigurations { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="string"></typeparam>
        /// <typeparam name="byte[]"></typeparam>
        /// <returns></returns>
        private Dictionary<string, byte[]> _resourceData = new Dictionary<string, byte[]>();

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public Dictionary<string, byte[]> ResourceData
        {
            get
            {
                return this._resourceData;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public QuestionResponseType ResponseType { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string CustomBuilderCodeBundleName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string CodeBundleName { get; set; }

		/// <summary>
		/// 
		/// </summary>
		/// <typeparam name="string"></typeparam>
		/// <typeparam name="string"></typeparam>
		/// <returns></returns>
        public Dictionary<string, string> TypeNameLocales { get; } = new Dictionary<string, string>();

        /// <summary>
        /// Set of Question Part Slots
        /// </summary>
        /// <value></value>
        public List<QuestionPartSlotDefinition> QuestionPartSlots { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public ISurveyQuestion Type { get; }

        /// <summary>
        /// How many "internal" views are available for this question - each view requires its own title text
        /// </summary>
        /// <value></value>
        public int InternalNavigationViewCount { get; set; } = 1;

        /// <summary>
        /// A list of in memory byte [] data of client code and modules
        /// that is to be served to the front end.
        /// </summary>
        /// <returns></returns>
        public static Dictionary<string, byte[]> ClientModules { get; set; } = new Dictionary<string, byte[]>();

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public Dictionary<string, QuestionResource> QuestionResources { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string Icon { get; set; }

        /// <summary>
        /// The name of the custom builder view, or null if no custom builder view.
        /// </summary>
        /// <value></value>
        public string CustomBuilderViewName { get; set; }

        /// <summary>
        /// Flag for whether or not this question type definition has a custom builder view.
        /// </summary>
        /// <value></value>
        public bool HasCustomBuilderView { get; set; } = false;

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public ResponseValidator ResponseValidator { get; private set; }

        public string ClassName {get;set;}

        public Dictionary<string, NestedQuestionDefinition> NestedQuestionDefinitions { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="type"></param>
        /// <param name="attribute"></param>
        public QuestionTypeDefinition(ISurveyQuestion type, SurveyQuestionAttribute attribute)
        {
            //var question = Activator.CreateInstance(type) as ISurveyQuestion;
            this.Type = type;
            TypeName = type.TypeName;
            Icon = type.Icon;
            ClassName = type.GetType().Name;
            QuestionResources = new Dictionary<string, QuestionResource>();

            CodeBundleName = attribute.CodeBundleName;
            CustomBuilderCodeBundleName = attribute.CustomBuilderCodeBundleName;

            if (type is INestedQuestionHost host)
            {
                var definitions = host.ConfigureNestedQuestions();
            }

            if (attribute.ResponseValidator != null)
            {

                var instance = (ResponseValidator)Activator.CreateInstance(attribute.ResponseValidator);
                this.ResponseValidator = instance;

                if (!string.IsNullOrEmpty(attribute.CustomBuilderView))
                {
                    this.CustomBuilderViewName = attribute.CustomBuilderView;
                    this.HasCustomBuilderView = true;
                }
            }

        }
    }
}