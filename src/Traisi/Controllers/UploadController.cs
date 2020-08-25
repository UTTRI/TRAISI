using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Net.Http.Headers;
using Traisi.Helpers;
using Traisi.Models.ViewModels;
using Traisi.ViewModels;

namespace Traisi.Controllers
{
    [Produces("application/json")]
    [Authorize(Authorization.Policies.AccessAdminPolicy)]
    [Route("api/[controller]")]
    public class UploadController : Controller
    {
        private IWebHostEnvironment _hostingEnvironment;
        private IFileDownloader _fileHelper;

        public UploadController(IWebHostEnvironment hostingEnvironment, IFileDownloader fileHelper)
        {
            _hostingEnvironment = hostingEnvironment;
            _fileHelper = fileHelper;
        }

        [HttpPost, DisableRequestSizeLimit, Produces(typeof(UploadPathViewModel))]
        public async Task<IActionResult> UploadFile()
        {
            try
            {
                var file = Request.Form.Files[0];
                string folderName = "Upload";
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath, folderName, this.User.Identity.Name);
                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                }
                if (file.Length > 0)
                {
                    string fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    string extension = Path.GetExtension(fileName);
                    fileName = _fileHelper.GenerateFileCode() + extension;
                    string fullPath = Path.Combine(newPath, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    string uploadPath = $"/{folderName}/{this.User.Identity.Name}/{fileName}";
                    
                    return Json(new UploadPathViewModel() { Link = uploadPath });
                }
                else
                {
                    return Json("Upload Failed: ");
                }
            }
            catch (System.Exception ex)
            {
                return Json("Upload Failed: " + ex.Message);
            }
        }

        [HttpPost("delete")]
        public IActionResult DeleteUploadedFile([FromBody] UploadPathViewModel uploadPath)
        {
            try
            {
                var fileSrc = uploadPath.Link.Replace('/', Path.DirectorySeparatorChar);
                string webRootPath = _hostingEnvironment.WebRootPath;
                string filePath  =webRootPath + fileSrc;
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                return new OkResult();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}