using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using DAL;
using DAL.Models.Surveys;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using CsvHelper;
using CsvHelper.Configuration;
using Hangfire;
using Hangfire.Common;
using Newtonsoft.Json;
using System.IO.Compression;

namespace TRAISI.Helpers
{
    public interface IFileDownloader
    {
        string GenerateFileCode();
        void ExportSurvey(string code, string userName, Survey survey);
        void WriteShortcodeFile(string code, string userName, string mode, Survey survey);
        void WriteGroupCodeFile(string code, string userName, string mode, Survey survey);

    }

    public class FileDownloaderService : IFileDownloader
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHubContext<NotifyHub> _notifyHub;
        private readonly Random _randomGen;
        private IHostingEnvironment _hostingEnvironment;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public FileDownloaderService(IUnitOfWork unitOfWork, IHubContext<NotifyHub> notifyHub,
            IHostingEnvironment hostingEnvironment, IServiceScopeFactory serviceScopeFactory)
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

        public void ExportSurvey(string code, string userName, Survey survey)
        {
            Task.Run(async () => {
                using (var scope = this._serviceScopeFactory.CreateScope())
                {
                    IUnitOfWork unitOfWorkInScope = (IUnitOfWork)scope.ServiceProvider.GetRequiredService(typeof(IUnitOfWork));
                    var fullSurveyStructure = await unitOfWorkInScope.Surveys.GetSurveyFullExportAsync(survey.Id);
                    string folderName = "Download";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName, userName, code);
                    string compressDirectory = Path.Combine(newPath, "Export");
                    string fileName = Path.Combine(compressDirectory, $"SurveyExport_{survey.Name}.json");
                    string zipFileName = Path.Combine(newPath, $"SurveyExport_{survey.Name}.zip");
                    string url = $"/{folderName}/{userName}/{code}/SurveyExport_{survey.Name}.zip";
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                        Directory.CreateDirectory(compressDirectory);
                    }
                    var progress = new NotifyHub.DownloadProgress() { Id = code, Progress = 50, Url = url };
                    await this._notifyHub.Clients.Group(userName).SendAsync("downloadUpdate", progress);

                    // Write out survey structure to json
                    using (var output = new StreamWriter(fileName))
                    {
                        output.Write(JsonConvert.SerializeObject(fullSurveyStructure, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.All }));
                    }

                    ZipFile.CreateFromDirectory(compressDirectory, zipFileName);
                    progress.Progress = 100;
                    await this._notifyHub.Clients.Group(userName).SendAsync("downloadUpdate", progress);
                    BackgroundJob.Schedule(() => Directory.Delete(newPath, true), TimeSpan.FromSeconds(30));
                }
            });
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
                    await this._notifyHub.Clients.Group(userName).SendAsync("downloadUpdate", progress);

                    // Write shortcodes to csv
                    using (var sw = new StreamWriter(fileName))
                    {
                        var writer = new CsvWriter(sw);
                        writer.Configuration.RegisterClassMap<ShortCodeMap>();

                        writer.WriteRecords(shortcodes);
                    }
                    progress.Progress = 100;
                    await this._notifyHub.Clients.Group(userName).SendAsync("downloadUpdate", progress);
                    BackgroundJob.Schedule(() => Directory.Delete(newPath,true), TimeSpan.FromSeconds(30));
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
            Task.Run(() =>
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
                    this._notifyHub.Clients.Group(userName).SendAsync("downloadUpdate", progress);

                    // Write shortcodes to csv
                    using (var sw = new StreamWriter(fileName))
                    {
                        var writer = new CsvWriter(sw);
                        writer.Configuration.RegisterClassMap<GroupCodeMap>();

                        writer.WriteRecords(groupcodes);
                    }
                    progress.Progress = 100;
                    this._notifyHub.Clients.Group(userName).SendAsync("downloadUpdate", progress);
                    BackgroundJob.Schedule(() => Directory.Delete(newPath,true), TimeSpan.FromSeconds(30));
                }
               
            });
        }

        public sealed class GroupCodeMap : ClassMap<GroupCode>
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