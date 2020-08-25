using System.Collections.Generic;

namespace Traisi.Sdk.Interfaces
{
    public interface INestedQuestionHost
    {
        /// <summary>
        /// 
        /// </summary>
        List<NestedQuestionDefinition> ConfigureNestedQuestions();
    }
}