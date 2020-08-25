using System;
using System.Collections.Generic;
using System.Linq;
using Traisi.Sdk.Enums;

namespace Traisi.Sdk.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class SurveyQuestionAttribute : Attribute
    {
        /// <summary>
        /// Specifies whether ot not this SurveyQuestion has a custom builder view.
        /// </summary>
        /// <returns></returns>
        public string CustomBuilderView { get; set; } = null;

        /// <summary>
        /// Gets the ResponseType format of this the attached question definition
        /// </summary>
        /// <returns></returns>
        public QuestionResponseType QuestionResponseType { get; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string[] UseResources { get; set; } = { };

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string CodeBundleName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        /// <value></value>
        public string CustomBuilderCodeBundleName { get; set; }

        /// <summary>
        /// How many "internal" views are available for this question - each view requires its own title text
        /// </summary>
        /// <value></value>
        public int InternalNavigationViewCount { get; set; } = 1;

        public Type ResponseValidator { get; set; }

        public string[] ModuleDependencies { get; set; } = { };

        /// <summary>
        /// 
        /// </summary>
        /// <param name="responseType"></param>
        /// <param name="language"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public SurveyQuestionAttribute(QuestionResponseType responseType, params string[] moduleDependencies)
        {
            this.QuestionResponseType = responseType;

            this.ModuleDependencies = moduleDependencies;
        }



    }
}