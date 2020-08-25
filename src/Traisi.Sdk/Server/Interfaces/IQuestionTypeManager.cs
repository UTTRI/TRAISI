using System.Collections.Generic;

namespace Traisi.Sdk.Interfaces
{
    /// <summary>
    /// Interface definition for the injectable QuestionTypeManager service.
    /// </summary>
    public interface IQuestionTypeManager
    {
        Dictionary<string,QuestionTypeDefinition> QuestionTypeDefinitions { get; }

        void LoadQuestionExtensions(string loadFrom = "extensions");
    }
}