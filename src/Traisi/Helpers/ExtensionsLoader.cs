using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.Logging;
using Traisi.Helpers.Interfaces;
using Traisi.Sdk.Interfaces;

namespace Traisi.Helpers
{

    public class ExtensionsLoader : IExtensionsLoader
    {

        private ILogger<ExtensionsLoader> _logger;

        private Dictionary<string, ITraisiIAuthorizationHandler> AuthorizationHandlers { get; set; }

        private Dictionary<string, Assembly> _fileAssemblyMap;


        public ExtensionsLoader(ILoggerFactory loggerFactory)
        {

            _logger = loggerFactory.CreateLogger<ExtensionsLoader>();
            _fileAssemblyMap = new Dictionary<string, Assembly>();
        }

        private void LoadAuthorizationHandlerExtensions()
        {

            var assemblies = LoadExtensionAssemblies();

        }

        
        private List<Assembly> LoadExtensionAssemblies()
        {
            var extensionAssemblies = new List<Assembly>();
            _logger.LogInformation("Loading TRAISI Authorization extensions");
            if (!Directory.Exists("extensions")) {
                _logger.LogWarning("Extensions folder does not exist.");
                return extensionAssemblies;
            }
            var s = from d in Directory.EnumerateFiles("extensions")
                    where d.EndsWith(".dll")
                    select d;

            var extensions = Directory.EnumerateFiles("extensions").Where(file => file.EndsWith("dll")).ToList();
            extensions.ForEach(file =>
            {
                try {
                    var loadFrom = Path.Combine(Directory.GetCurrentDirectory(), file);
                    byte[] assemblyData = File.ReadAllBytes(loadFrom);
                    Assembly assembly = Assembly.Load(assemblyData);

                    //Assembly assembly = Assembly.Load(assemblyData);
                    _fileAssemblyMap[loadFrom] = assembly;
                    extensionAssemblies.Add(assembly);
                    _logger.LogInformation($"Loading extension {Path.GetFileName(file)}");
                }
                catch (Exception e) {
                    _logger.LogWarning(e, "Error loading extension assembly.");
                }
            });

            return extensionAssemblies;
        }

        public void LoadExtensions()
        {
            LoadAuthorizationHandlerExtensions();
        }
    }
}