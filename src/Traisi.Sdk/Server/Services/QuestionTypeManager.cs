using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Runtime.Serialization.Formatters.Binary;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Traisi.Sdk;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Interfaces;

namespace Traisi.Sdk.Services
{
    public class QuestionTypeManager : IQuestionTypeManager
    {
        private readonly IConfiguration _configuration;

        private readonly ILogger<QuestionTypeManager> _logger;

        private readonly ILoggerFactory _loggerFactory;

        private Dictionary<string, Assembly> _fileAssemblyMap;


        /// <summary>
        /// </summary>
        /// <param name="configuration"></param>
        public QuestionTypeManager(IConfiguration configuration,
            ILoggerFactory loggerFactory)
        {
            _configuration = configuration;
            _loggerFactory = loggerFactory;
            _logger = loggerFactory.CreateLogger<QuestionTypeManager>();
            _fileAssemblyMap = new Dictionary<string, Assembly>();
            QuestionTypeDefinitions = new Dictionary<string, QuestionTypeDefinition>();

        }

        /// <summary>
        /// 
        /// </summary>
        private void ResetExtensions()
        {
            _fileAssemblyMap.Clear();
            this.QuestionTypeDefinitions.Clear();
        }

        /// <summary>
        /// </summary>
        public void LoadQuestionExtensions(string loadFrom = "extensions")
        {
            var extensionList = LoadExtensionAssemblies(loadFrom);
            LoadQuestionTypeDefinitions(extensionList, loadFrom);
        }

        ///
        public Dictionary<string, QuestionTypeDefinition> QuestionTypeDefinitions { get; }

        /// <summary>
        /// The collection of shared resources made available by all contributing extensions and questions.
        /// </summary>
        /// <value></value>
        public static Dictionary<string, QuestionResource> SharedQuestionResources { get; } = new Dictionary<string, QuestionResource>();


        /// <summary>
        /// </summary>
        /// <param name="questionType"></param>
        /// <param name="attribute"></param>
        /// <param name="sourceAssembly"></param>
        private QuestionTypeDefinition CreateQuestionTypeDefinition(Type questionType, SurveyQuestionAttribute attribute,
            Assembly sourceAssembly, Dictionary<string, Dictionary<string, string>> locales)
        {
            var typeDefinition =
                new QuestionTypeDefinition(Activator.CreateInstance(questionType) as ISurveyQuestion, attribute);
            Console.WriteLine(questionType);
            var configurations = ReadQuestionConfigurationData(questionType, sourceAssembly);
            typeDefinition.QuestionConfigurations = configurations;
            var parameterOptions = ReadQuestionOptionData(questionType, sourceAssembly);
            typeDefinition.QuestionOptions = parameterOptions;
            typeDefinition.QuestionPartSlots = ListQuestionSlots(questionType);
            QuestionTypeDefinitions[typeDefinition.TypeName] = typeDefinition;


            ReadResponseType(attribute, typeDefinition);
            ReadQuestionResourceData(typeDefinition, questionType, sourceAssembly);
            ReadLocaleData(sourceAssembly);
            GetTypeClientData(typeDefinition, sourceAssembly);

            foreach (var locale in locales.Keys)
            {
                typeDefinition.TypeNameLocales[locale] = locales[locale][typeDefinition.TypeName.ToLower()];

            }

            return typeDefinition;
        }

        /// <summary>
        /// </summary>
        /// <param name="attribute"></param>
        /// <param name="definition"></param>
        private void ReadResponseType(SurveyQuestionAttribute attribute, QuestionTypeDefinition definition)
        {
            definition.ResponseType = attribute.QuestionResponseType;
        }


        /// <summary>
        /// </summary>
        /// <param name="questionType"></param>
        /// <returns></returns>
        public List<QuestionPartSlotDefinition> ListQuestionSlots(Type questionType)
        {
            var list = new List<QuestionPartSlotDefinition>();

            foreach (var att in questionType.GetCustomAttributes(typeof(QuestionPartSlotAttribute)))
                list.Add(new QuestionPartSlotDefinition
                {
                    Description = (att as QuestionPartSlotAttribute).Description,
                    Name = (att as QuestionPartSlotAttribute).SlotName,
                    SlotOrder = (att as QuestionPartSlotAttribute).SlotOrder
                });


            return list;
        }

        /// <summary>
        /// </summary>
        /// <param name="definition"></param>
        /// <param name="questionType"></param>
        private void ReadQuestionResourceData(QuestionTypeDefinition definition, Type questionType,
            Assembly sourceAssembly)
        {
            var members = questionType.GetMembers();
            foreach (var member in members)
            {
                var attributes = member.GetCustomAttributes();
                foreach (var attribute in attributes)
                {
                    if (attribute.GetType() == typeof(HasResourceAttribute))
                    {
                        var hasResourceAttribute = (HasResourceAttribute)attribute;

                        byte[] data;
                        using (var ms = new MemoryStream())
                        {
                            sourceAssembly.GetManifestResourceStream(hasResourceAttribute.ResourceName).CopyTo(ms);
                            data = ms.ToArray();
                        }

                        definition.QuestionResources[hasResourceAttribute.ResourceName] =
                            new QuestionResource
                            {
                                ResourceName = hasResourceAttribute.ResourceName,
                                Data = data,
                                FieldName = member.Name
                            };
                    }
                }
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sourceAssembly"></param>
        /// <returns></returns>
        private Dictionary<string, Dictionary<string, string>> ReadLocaleData(Assembly sourceAssembly)
        {
            if (!sourceAssembly.GetManifestResourceNames().Contains("locales"))
            {
                return new Dictionary<string, Dictionary<string, string>>();
            }
            byte[] data;
            using (var ms = new MemoryStream())
            {
                sourceAssembly.GetManifestResourceStream("locales").CopyTo(ms);
                data = ms.ToArray();
            }

            string json = System.Text.Encoding.UTF8.GetString(data);

            var localeObj = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(json);

            return localeObj;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="configAttribute"></param>
        /// <param name="sourceAssembly"></param>
        /// <returns></returns>
        private byte[] GetQuestionConfigurationData(QuestionConfigurationAttribute configAttribute,
            Assembly sourceAssembly)
        {
            byte[] data = null;
            if (configAttribute.Resource != null)
                using (var ms = new MemoryStream())
                {
                    try
                    {
                        sourceAssembly.GetManifestResourceStream(configAttribute.Resource).CopyTo(ms);
                        data = ms.ToArray();
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e,"Could not find requested quesiont resource: " + configAttribute.Resource);
                    }

                }

            return data;
        }

        /// <summary>
        ///    Returns the QuestionTypeDefinition associated with the passed name
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public QuestionTypeDefinition GetQuestionTypeDefinition(string name)
        {
            return QuestionTypeDefinitions[name];
        }

        /// <summary>
        /// </summary>
        /// <param name="questionType"></param>
        /// <param name="sourceAssembly"></param>
        /// <returns></returns>
        private Dictionary<string, QuestionConfigurationDefinition> ReadQuestionConfigurationData(Type questionType,
            Assembly sourceAssembly)
        {
            var properties = questionType.GetProperties();
            var members = questionType.GetMembers();
            var configuration = new Dictionary<string, QuestionConfigurationDefinition>();
            foreach (var member in members)
            {
                var attributes = member.GetCustomAttributes();
                if (attributes.Count() > 0)
                {
                    foreach (var attribute in attributes)
                    {
                        if (attribute.GetType() == typeof(QuestionConfigurationAttribute))
                        {
                            var configAttribute = attribute as QuestionConfigurationAttribute;
                            byte[] data = GetQuestionConfigurationData(configAttribute, sourceAssembly);
                            if (configAttribute.Resource != null)
                            {
                                SharedQuestionResources[configAttribute.Resource] = new QuestionResource()
                                {
                                    Data = data,
                                    ResourceName = configAttribute.Resource,

                                };
                            }
                            var definition = new QuestionConfigurationDefinition
                            {
                                PropertyName = member.Name,
                                DisplayName = configAttribute.DisplayName,
                                Description = configAttribute.Description,
                                TypeId = configAttribute.TypeId,
                                ValueType = configAttribute.ValueType,
                                BuilderType = configAttribute.SurveyBuilderValueType,
                                DefaultValue = configAttribute.DefaultValue,
                                ResourceData = data,
                                SharedResource = configAttribute.SharedResource,
                                IsTranslatable = configAttribute.IsTranslatable,
                                Configuration = _configuration != null ? _configuration.GetSection($"QuestionConfigurations:{questionType.FullName}").Get<Dictionary<string, string>>() : new Dictionary<string, string>()

                            };
                            configuration.Add(configAttribute.DisplayName, definition);
                            ;
                        }
                    }
                }
            }

            return configuration;
        }

        /// <summary>
        ///    Reads the configuration information from the assembly
        /// </summary>
        /// <param name="questionType"></param>
        /// <param name="sourceAssembly"></param>
        /// <returns></returns>
        private Dictionary<string, QuestionOptionDefinition> ReadQuestionOptionData(Type questionType,
            Assembly sourceAssembly)
        {
            var properties = questionType.GetProperties();
            var members = questionType.GetMembers();
            var configuration = new Dictionary<string, QuestionOptionDefinition>();
            foreach (var member in members)
            {
                var attributes = member.GetCustomAttributes();
                if (attributes.Count() > 0)
                {
                    foreach (var attribute in attributes)
                    {
                        if (attribute.GetType() == typeof(QuestionOptionAttribute))
                        {
                            var configAttribute = attribute as QuestionOptionAttribute;
                            configuration.Add(configAttribute.Name, new QuestionOptionDefinition
                            {
                                Name = configAttribute.Name,
                                Description = configAttribute.Description,
                                ValueType = configAttribute.ValueType,
                                IsMultipleAllowed = configAttribute.IsMultipleAllowed,
                                TypeId = configAttribute.TypeId
                            });


                        }
                    }
                }
            }

            return configuration;
        }

        /// <summary>
        ///    Reads all resource data besides question client (js) data and adds it to the the resource dictionary
        ///    The key is either the predefined key or the file name if it was not present
        /// </summary>
        /// <param name="typeDefinition"></param>
        /// <param name="sourceAssembly"></param>
        private void ReadResourceData(QuestionTypeDefinition typeDefinition, Assembly sourceAssembly,
            string[] resources)
        {
            var resourceNames =
                sourceAssembly.GetManifestResourceNames().Where(r => !r.EndsWith(".module.js")).ToArray();

            var formatter = new BinaryFormatter();
            foreach (var resourceName in resources)
                using (var ms = new MemoryStream())
                {
                    sourceAssembly.GetManifestResourceStream(resourceName).CopyTo(ms);
                    typeDefinition.ResourceData[resourceName] = ms.ToArray();
                }
        }

        /// <summary>
        /// </summary>
        /// <param name="typeDefinition"></param>
        /// <param name="sourceAssembly"></param>
        /// <returns></returns>
        private void GetTypeClientData(QuestionTypeDefinition typeDefinition, Assembly sourceAssembly)
        {

            var moduleResourceNames = sourceAssembly.GetManifestResourceNames().Where(r => r.EndsWith(".module.js"));

            foreach (var resourceName in moduleResourceNames)
            {
                using (var ms = new MemoryStream())
                {
                    sourceAssembly.GetManifestResourceStream(resourceName).CopyTo(ms);


                    QuestionTypeDefinition.ClientModules[resourceName] = ms.ToArray();
                }
            }
        }

        /// <summary>
        ///    Load all extension (dll) included in the configured extensions directory.
        /// </summary>
        private List<Assembly> LoadExtensionAssemblies(string loadFrom = "extensions")
        {
            var extensionAssemblies = new List<Assembly>();
            _logger.LogInformation("Loading TRAISI extensions");
            if (!Directory.Exists(loadFrom))
            {
                _logger.LogWarning("Extensions folder does not exist.");
                return extensionAssemblies;
            }

            //assume from configuration at the moment
            var s = from d in Directory.EnumerateFiles(loadFrom)
                    where d.EndsWith(".dll")
                    select d;

            var extensions = Directory.EnumerateFiles(loadFrom).Where(file => file.EndsWith("dll")).ToList();
            extensions.ForEach(file =>
            {
                try
                {
                    var loadFrom = Path.Combine(Directory.GetCurrentDirectory(), file);
                    byte[] assemblyData = File.ReadAllBytes(loadFrom);
                    Assembly assembly = Assembly.Load(assemblyData);

                    //Assembly assembly = Assembly.Load(assemblyData);
                    _fileAssemblyMap[loadFrom] = assembly;
                    extensionAssemblies.Add(assembly);
                    _logger.LogInformation($"Loading extension {Path.GetFileName(file)}");
                }
                catch (Exception e)
                {
                    _logger.LogWarning(e, "Error loading extension assembly.");
                }
            });

            return extensionAssemblies;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="extensionList"></param>
        /// <param name="loadFrom"></param>
        public void LoadQuestionTypeDefinitions(List<Assembly> extensionList, string loadFrom = ".")
        {
            var assemblies = AppDomain.CurrentDomain.GetAssemblies();

            foreach (var assembly in extensionList)
            {

                try
                {
                    var types = assembly.GetTypes();
                    var locales = ReadLocaleData(assembly);


                    foreach (var type in types)
                    {
                        var e = type.GetCustomAttributes(typeof(SurveyQuestionAttribute));

                        foreach (var attribute in e)
                        {
                            if (attribute.GetType() == typeof(SurveyQuestionAttribute))
                            {
                                var questionType = CreateQuestionTypeDefinition(type, (SurveyQuestionAttribute)attribute, assembly, locales);


                            }
                        }
                    }

                    _logger.LogInformation("Finished loading extension assembly: " + assembly.FullName);


                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Error loading extension assembly: " + assembly.FullName);
                }


            }
        }


    }
}