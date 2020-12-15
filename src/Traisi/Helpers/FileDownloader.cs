using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Traisi.Data;
using Traisi.Data.Models.Surveys;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using CsvHelper;
using CsvHelper.Configuration;
using Hangfire;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System.Globalization;
using Newtonsoft.Json.Converters;
using TRAISI.Export;

namespace Traisi.Helpers
{
    public interface IFileDownloader
    {
        string GenerateFileCode();
        Task<string> ExportSurvey(string code, string userName, Survey survey);
        Task<Survey> ExtractSurveyImportAsync(IFormFile importFile, string userName);
        void WriteShortcodeFile(string code, string userName, string mode, Survey survey);
        void WriteGroupCodeFile(string code, string userName, string mode, Survey survey);
        void WriteErrorCodes(string code, string userName, List<(string, string, string)> codesWithErrors);
    }

    public class FileDownloaderService : IFileDownloader
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHubContext<NotifyHub, INotifyHub> _notifyHub;
        private readonly Random _randomGen;
        private IWebHostEnvironment _hostingEnvironment;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public FileDownloaderService(IUnitOfWork unitOfWork, IHubContext<NotifyHub, INotifyHub> notifyHub,
            IWebHostEnvironment hostingEnvironment, IServiceScopeFactory serviceScopeFactory)
        {
            this._unitOfWork = unitOfWork;
            this._notifyHub = notifyHub;
            this._randomGen = new Random();
            this._hostingEnvironment = hostingEnvironment;
            this._serviceScopeFactory = serviceScopeFactory;
        }

        public string GenerateFileCode()
        {
            string code = Guid.NewGuid().ToString("N").Substring(0, 10);
            return code.ToUpper();
        }

        public async Task<string> ExportSurvey(string code, string userName, Survey survey)
        {

            string zipFileName = default;
            using (var scope = this._serviceScopeFactory.CreateScope())
            {
                IUnitOfWork unitOfWorkInScope = (IUnitOfWork)scope.ServiceProvider.GetRequiredService(typeof(IUnitOfWork));
                var fullSurveyStructure = await unitOfWorkInScope.Surveys.GetSurveyFullExportAsync(survey.Id);
                string folderName = "Download";
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath, folderName, userName ?? "anon", code);
                string compressDirectory = Path.Combine(newPath, "Export");
                string fileName = Path.Combine(compressDirectory, $"SurveyExport_{survey.Name}.json");
                zipFileName = Path.Combine(newPath, $"SurveyExport_{survey.Name}.zip");
                string url = $"/{folderName}/{userName}/{code}/SurveyExport_{survey.Name}.zip";
                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                    Directory.CreateDirectory(compressDirectory);
                }
                //var progress = new NotifyHub.DownloadProgress () { Id = code, Progress = 50, Url = url };
                //await this._notifyHub.Clients.Group (userName).DownloadUpdate (progress);

                // Write out survey structure to json
                using (var output = new StreamWriter(fileName))
                {
                    var settings = new JsonSerializerSettings();
                    settings.PreserveReferencesHandling = PreserveReferencesHandling.All;
                    settings.Converters.Add(new StringEnumConverter());
                    output.Write(JsonConvert.SerializeObject(fullSurveyStructure, settings));
                }

                ZipFile.CreateFromDirectory(compressDirectory, zipFileName);
                //progress.Progress = 100;
                //await this._notifyHub.Clients.Group (userName).DownloadUpdate (progress);
                //BackgroundJob.Schedule (() => Directory.Delete (newPath, true), TimeSpan.FromSeconds (30));
                return zipFileName;
            }
        }
        
        public void WriteErrorCodes(string code, string userName, List<(string, string, string)> codesWithErrors)
        {
            Task.Run(async () =>
            {
                string folderName = "Download";
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath, folderName, userName, code);
                string fileName = Path.Combine(newPath, $"optionErrorList.csv");
                string url = $"/{folderName}/{userName}/{code}/optionErrorList.csv";
                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                }
                var progress = new NotifyHub.DownloadProgress() { Id = code, Progress = 50, Url = url };
                await this._notifyHub.Clients.Group(userName).DownloadUpdate(progress);

                        // Write shortcodes to csv
                        using (TextWriter sw = new StreamWriter(fileName))
                {
                    var writer = new CsvWriter(sw, CultureInfo.InvariantCulture);
                    writer.Configuration.RegisterClassMap<QuestionOptionMap>();
                    var codeList = codesWithErrors.Select(r => new QuestionOptionData() { Code = r.Item1, Label = r.Item2, Reason = r.Item3 });
                    writer.WriteRecords(codeList);
                }
                progress.Progress = 100;
                await this._notifyHub.Clients.Group(userName).DownloadUpdate(progress);
                BackgroundJob.Schedule(() => Directory.Delete(newPath, true), TimeSpan.FromSeconds(30));
            });
        }

        public class QuestionOptionData
        {
            public string Code { get; set; }
            public string Label { get; set; }
            public string Reason { get; set; }
        }

        public sealed class QuestionOptionMap : ClassMap<QuestionOptionData>
        {
            public QuestionOptionMap()
            {
                Map(m => m.Code);
                Map(m => m.Label);
                Map(m => m.Reason);
            }
        }

        public async Task<Survey> ExtractSurveyImportAsync(IFormFile importFile, string userName)
        {
            Survey importSurvey = null;

            string folderName = "Upload";
            string webRootPath = _hostingEnvironment.WebRootPath;
            string code = this.GenerateFileCode();
            string newPath = Path.Combine(webRootPath, folderName, userName, code);
            string expandDirectory = Path.Combine(newPath, "Import");
            string zipFileName = Path.Combine(newPath, $"SurveyImport.zip");

            if (!Directory.Exists(expandDirectory))
            {
                Directory.CreateDirectory(expandDirectory);
            }

            using (FileStream fileStream = new FileStream(zipFileName, FileMode.Create))
            {
                await importFile.CopyToAsync(fileStream);
            }

            ZipFile.ExtractToDirectory(zipFileName, expandDirectory);

            var files = Directory.EnumerateFiles(expandDirectory);

            foreach (string file in files)
            {
                if (file.EndsWith(".json"))
                {
                    using (StreamReader r = new StreamReader(file))
                    {
                        var jsonFile = r.ReadToEnd();
                        importSurvey = JsonConvert.DeserializeObject<Survey>(jsonFile, new JsonSerializerSettings { PreserveReferencesHandling = PreserveReferencesHandling.Objects });
                    }
                    break;
                }
            }

            Directory.Delete(newPath, true);

            return importSurvey;
        }

        public void WriteShortcodeFile(string code, string userName, string mode, Survey survey)
        {

            Task.Run(async () =>
            {
                using (var scope = this._serviceScopeFactory.CreateScope())
                {
                    IUnitOfWork unitOfWorkInScope = (IUnitOfWork)scope.ServiceProvider.GetRequiredService(typeof(IUnitOfWork));
                    var shortcodes = unitOfWorkInScope.Shortcodes.GetShortcodesForSurvey(survey.Id, mode == "test");

                    string folderName = "Download";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName, userName, code);
                    string fileName = Path.Combine(newPath, $"ShortcodeList_{survey.Name}_{mode}.csv");
                    string url = $"/{folderName}/{userName}/{code}/ShortcodeList_{survey.Name}_{mode}.csv";
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                    }
                    var progress = new NotifyHub.DownloadProgress() { Id = code, Progress = 50, Url = url };
                    await this._notifyHub.Clients.Group(userName).DownloadUpdate(progress);

                    // Write shortcodes to csv
                    using (TextWriter sw = new StreamWriter(fileName))
                    {
                        var writer = new CsvWriter(sw, CultureInfo.InvariantCulture);
                        writer.Configuration.RegisterClassMap<ShortCodeMap>();

                        writer.WriteRecords(shortcodes);
                    }
                    progress.Progress = 100;
                    await this._notifyHub.Clients.Group(userName).DownloadUpdate(progress);
                    BackgroundJob.Schedule(() => Directory.Delete(newPath, true), TimeSpan.FromSeconds(30));
                }

            });
        }

        public sealed class ShortCodeMap : ClassMap<Shortcode>
        {
            public ShortCodeMap()
            {
                Map(m => m.Code);
                Map(m => m.IsTest);
                Map(m => m.CreatedDate);
            }
        }

        public void WriteGroupCodeFile(string code, string userName, string mode, Survey survey)
        {
            Task.Run(async () =>
            {
                using (var scope = this._serviceScopeFactory.CreateScope())
                {
                    IUnitOfWork unitOfWorkInScope = (IUnitOfWork)scope.ServiceProvider.GetRequiredService(typeof(IUnitOfWork));
                    var groupcodes = unitOfWorkInScope.GroupCodes.GetGroupCodesForSurvey(survey.Id, mode == "test");

                    string folderName = "Download";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName, userName, code);
                    string fileName = Path.Combine(newPath, $"GroupCodeList_{survey.Name}_{mode}.csv");
                    string url = $"/{folderName}/{userName}/{code}/GroupCodeList_{survey.Name}_{mode}.csv";
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                    }
                    var progress = new NotifyHub.DownloadProgress() { Id = code, Progress = 50, Url = url };
                    await this._notifyHub.Clients.Group(userName).DownloadUpdate(progress);

                    // Write shortcodes to csv
                    using (var sw = new StreamWriter(fileName))
                    {
                        var writer = new CsvWriter(sw, CultureInfo.InvariantCulture);
                        writer.Configuration.RegisterClassMap<GroupCodeMap>();

                        writer.WriteRecords(groupcodes);
                    }
                    progress.Progress = 100;
                    await this._notifyHub.Clients.Group(userName).DownloadUpdate(progress);
                    BackgroundJob.Schedule(() => Directory.Delete(newPath, true), TimeSpan.FromSeconds(30));
                }

            });
        }

        public sealed class GroupCodeMap : ClassMap<Groupcode>
        {
            public GroupCodeMap()
            {
                Map(m => m.Code);
                Map(m => m.Name);
                Map(m => m.IsTest);
                Map(m => m.CreatedDate);
            }
        }

    }

}