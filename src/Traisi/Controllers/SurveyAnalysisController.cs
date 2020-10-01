using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Traisi.Data;
using Traisi.Data.Core;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Traisi.Helpers;
using Traisi.Sdk;
using Traisi.Sdk.Interfaces;
using Traisi.Services.Interfaces;
using Traisi.ViewModels;
using Traisi.ViewModels.Extensions;
using Traisi.ViewModels.Questions;
using Traisi.ViewModels.SurveyBuilder;
using Traisi.Models.ViewModels;
using Traisi.Models.Extensions;

namespace Traisi.Controllers
{
    [Authorize(Authorization.Policies.AccessAdminPolicy)]
    [Route("api/[controller]")]
    public class SurveyAnalysisController : Controller
    {
    }
}