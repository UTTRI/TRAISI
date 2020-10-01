using System;
using Microsoft.AspNetCore.Mvc;
using Traisi.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.IO;
using Microsoft.Extensions.Configuration;
using Traisi.Sdk;
using Traisi.Sdk.Interfaces;

namespace Traisi.Controllers
{
    [Route("api/[controller]")]
    public class QuestionController : Controller
    {
        private IQuestionTypeManager _questionTypeManager;
        private IConfiguration _configuration;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="questionTypeManager"></param>
        /// <param name="configuration"></param>
        public QuestionController(IQuestionTypeManager questionTypeManager, IConfiguration configuration)
        {
            this._questionTypeManager = questionTypeManager;
            this._configuration = configuration;
        }

        /// <summary>
        /// Loads the browser client bundle file from the passed question definition and bundle name.
        /// </summary>
        /// <param name="definition"></param>
        /// <param name="bundleName"></param>
        /// <returns></returns>
        private async Task<FileContentResult> LoadCodeBundleFile(QuestionTypeDefinition definition, string bundleName, bool es5 = false)
        {
            if (bundleName == null)
            {
                return File(QuestionTypeDefinition.ClientModules.Values.ToList()[0], "application/javascript");
            }

            if (es5)
            {
                bundleName = bundleName.Replace(".module.js", "es5.module.js");
            }

            // check if loading development bundle
            if (System.IO.File.Exists(Path.Combine("development", bundleName)))
            {
                return File(await System.IO.File.ReadAllBytesAsync(Path.Combine("development", bundleName)), "application/javascript");
            }
            else
            {
                return File(
                QuestionTypeDefinition.ClientModules[
                    QuestionTypeDefinition.ClientModules.Keys
                        .FirstOrDefault(k => k.EndsWith(bundleName,
                            StringComparison.InvariantCultureIgnoreCase))],
                "application/javascript");
            }

        }

        /// <summary>
        /// Returns the builder client code (browser) for the associated question type.
        /// </summary>
        /// <param name="questionType"></param>
        ///<param name="es5"></param>
        /// <returns></returns>
        [HttpGet("client-code/builder/{questionType}")]
        public async Task<ActionResult> CustomBuilderClientCode(string questionType, [FromQuery] bool es5 = false)
        {
            if (!_questionTypeManager.QuestionTypeDefinitions.Keys.Contains(questionType))
            {
                return new NotFoundResult();
            }
            else
            {
                try
                {
                    return await this.LoadCodeBundleFile(_questionTypeManager.QuestionTypeDefinitions[questionType],
                     _questionTypeManager.QuestionTypeDefinitions[questionType].CustomBuilderCodeBundleName, es5);
                }
                catch (Exception e)
                {
                    return new BadRequestObjectResult(e);
                }
            }

        }


        /// <summary>
        /// Returns the bundled module.js client code for the requested
        /// question definition.
        /// </summary>
        /// <param name="questionType"></param>
        /// <returns></returns>
        [HttpGet("client-code/{questionType}")]
        public async Task<ActionResult> ClientCode(string questionType, [FromQuery] bool es5 = false)
        {
            if (!_questionTypeManager.QuestionTypeDefinitions.Keys.Contains(questionType))
            {
                return new NotFoundResult();
            }
            else
            {
                try
                {
                    return await this.LoadCodeBundleFile(_questionTypeManager.QuestionTypeDefinitions[questionType], _questionTypeManager.QuestionTypeDefinitions[questionType].CodeBundleName, es5);
                }
                catch (Exception e)
                {
                    return new BadRequestObjectResult(e);
                }
            }
        }


        /// <summary>
        /// Retrieves the survey builder browser code for the associated question.
        /// </summary>
        /// <param name="questionType"></param>
        /// <returns></returns>
        [HttpGet("client-builder-code/{questionType}")]
        public async Task<ActionResult> ClientBuilderCode(string questionType)
        {
            try
            {
                if (!_questionTypeManager.QuestionTypeDefinitions.Keys.Contains(questionType))
                {
                    return new NotFoundResult();
                }

                var questionTypeDefinition =
                    _questionTypeManager.QuestionTypeDefinitions[questionType];

                if (!questionTypeDefinition.HasCustomBuilderView)
                {
                    return BadRequest("Specified question type has no custom builder interface");
                }

                if (questionTypeDefinition.CodeBundleName == null)
                {
                    return File(QuestionTypeDefinition.ClientModules.Values.ToList()[0], "application/javascript");
                }
                else
                {

                    var path = Path.Combine("development", questionTypeDefinition.CodeBundleName);
                    if (System.IO.File.Exists(path))
                    {
                        return File(await System.IO.File.ReadAllBytesAsync(path), "application/javascript");
                    }
                }

                return File(
                    QuestionTypeDefinition.ClientModules[
                        QuestionTypeDefinition.ClientModules.Keys
                            .FirstOrDefault(k => k.EndsWith(questionTypeDefinition.CodeBundleName,
                                StringComparison.InvariantCultureIgnoreCase))],
                    "application/javascript");
            }
            catch (Exception e)
            {
                //return error if not found
                return new BadRequestObjectResult(e);
            }
        }

        /// <summary>
        /// Retrieves a list of all question types that are loaded on the server.
        /// </summary>
        /// <returns></returns>
        [HttpGet("question-types")]
        [Produces(typeof(List<QuestionTypeDefinition>))]
        public IEnumerable<QuestionTypeDefinition> QuestionTypes()
        {
            var questionTypes = this._questionTypeManager.QuestionTypeDefinitions;
            return questionTypes.Values;
        }

        /// <summary>
        /// Returns the configuration dictionary for the associated question type. It is loaded from any of the configurations
        /// provided to the server application (appsettings.json etc)
        /// </summary>
        /// <param name="questionType"></param>
        /// <returns></returns>
        [HttpGet("configurations/{questionType}")]
        public IActionResult GetQuestionConfiguration(string questionType)
        {
            if (!this._questionTypeManager.QuestionTypeDefinitions.TryGetValue(questionType, out var definition))
            {
                return new NotFoundResult();
            }
            var config = this._configuration.GetSection($"QuestionConfigurations:{definition.Type.GetType().FullName}")?.GetChildren();
            return new OkObjectResult(config.ToDictionary(x => x.Key, x => x.Value));

        }
    }
}