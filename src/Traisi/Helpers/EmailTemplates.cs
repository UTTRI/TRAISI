using System;
using System.Text;
using System.Collections.Generic;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace Traisi.Helpers
{
    public static class EmailTemplates
    {
        static IWebHostEnvironment _hostingEnvironment;
        static IConfiguration _configuration;
        static private Dictionary<string, string> _templates;


        public static void Initialize(IWebHostEnvironment hostingEnvironment, IConfiguration configuration)
        {
            _hostingEnvironment = hostingEnvironment;
            _configuration = configuration;
            _templates = new Dictionary<string, string>();
        }

        public static string GetTemplate(string templateName, Dictionary<string,string> templateReplacements)
        {

            if (!_templates.ContainsKey(templateName))
            {
                var emailTemplatePath = _configuration.GetSection("EmailTemplates").GetValue<string>(templateName);
                _templates[templateName] = ReadPhysicalFile(emailTemplatePath);
            }
            StringBuilder htmlBuilder = new StringBuilder(_templates[templateName]);

            if (templateReplacements != null)
            {
                foreach (var templateField in templateReplacements)
                {
                    htmlBuilder.Replace("{{ " + templateField.Key + " }}", templateField.Value);
                }
            }

            return htmlBuilder.ToString();
        }



        private static string ReadPhysicalFile(string path)
        {
            if (_hostingEnvironment == null)
                throw new InvalidOperationException($"{nameof(EmailTemplates)} is not initialized");

            IFileInfo fileInfo = _hostingEnvironment.ContentRootFileProvider.GetFileInfo(path);

            if (!fileInfo.Exists)
                throw new FileNotFoundException($"Template file located at \"{path}\" was not found");

            using (var fs = fileInfo.CreateReadStream())
            {
                using (var sr = new StreamReader(fs))
                {
                    return sr.ReadToEnd();
                }
            }
        }
    }

}
