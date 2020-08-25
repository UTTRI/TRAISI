using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AspNet.Security.OAuth.Validation;
using AspNet.Security.OpenIdConnect.Primitives;
using AutoMapper;
using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NSwag;
using NSwag.Generation.Processors.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using OpenIddict.Abstractions;
using Serilog;
using Traisi.Authorization;
using Traisi.Controllers.Constraints;
using Traisi.Data;
using Traisi.Data.Core;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models;
using Traisi.Helpers;
using Traisi.Helpers.Interfaces;
using Traisi.Models.Mapping;
using Traisi.Sdk.Interfaces;
using Traisi.Sdk.Services;
using Traisi.Services;
using Traisi.Services.Interfaces;
using Traisi.ViewModels;

using AppPermissions = Traisi.Data.Core.ApplicationPermissions;
using
    IAuthorizationHandler
    =
        Microsoft.AspNetCore.Authorization.IAuthorizationHandler;

namespace Traisi
{
    public class Startup
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly string
            DEFAULT_SURVEY_VIEWER_SPA_START_SCRIPT = "start2";

        /// <summary>
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="env"></param>
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            _hostingEnvironment = env;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        /// <summary>
        /// </summary>
        /// <param name="services"></param>
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .AddDbContext<ApplicationDbContext>(options =>
                {
                    bool
                        .TryParse(Configuration
                            .GetSection("DevelopmentSettings")
                            .GetSection("UseSqliteDatabaseProvider")
                            .Value,
                        out var development);

                    var dbString = Configuration.GetValue<string>("database");
                    if (dbString != null)
                    {
                        options
                            .UseNpgsql(dbString,
                            b =>
                            {
                                b.MigrationsAssembly("Traisi");
                                b.UseNetTopologySuite();
                            });
                    }
                    else
                    {
                        options
                            .UseNpgsql(Configuration["ConnectionStrings:DefaultConnection"],
                            b =>
                            {
                                b.MigrationsAssembly("Traisi");
                                b.UseNetTopologySuite();
                            });
                    }
                    options.UseOpenIddict();
                });

            // add identity
            services
                .AddIdentity<ApplicationUser, ApplicationRole>(options =>
                {
                })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services
                .AddIdentityCore<TraisiUser>()
                .AddRoles<ApplicationRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services
                .AddIdentityCore<SurveyUser>(options =>
                {
                    options.User.RequireUniqueEmail = false;
                    options.SignIn.RequireConfirmedEmail = false;
                    options.SignIn.RequireConfirmedPhoneNumber = false;
                    options.Lockout.MaxFailedAccessAttempts = 3;
                    options.Lockout.DefaultLockoutTimeSpan =
                        new System.TimeSpan(0, 30, 0);
                })
                .AddUserManager<UserManager<SurveyUser>>()
                .AddSignInManager<SignInManager<SurveyUser>>()
                .AddRoles<ApplicationRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Configure Identity options and password complexity here
            services
                .Configure<IdentityOptions>(options =>
                {
                    // User settings
                    options.User.RequireUniqueEmail = true;

                    //    //// Password settings
                    //    //options.Password.RequireDigit = true;
                    //    //options.Password.RequiredLength = 8;
                    //    //options.Password.RequireNonAlphanumeric = false;
                    //    //options.Password.RequireUppercase = true;
                    //    //options.Password.RequireLowercase = false;
                    //    //// Lockout settings
                    options.User.AllowedUserNameCharacters =
                        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                    options.Lockout.DefaultLockoutTimeSpan =
                        TimeSpan.FromMinutes(60 * 4);
                    options.Lockout.MaxFailedAccessAttempts = 10;

                    options.ClaimsIdentity.UserNameClaimType =
                        OpenIdConnectConstants.Claims.Name;
                    options.ClaimsIdentity.UserIdClaimType =
                        OpenIdConnectConstants.Claims.Subject;
                    options.ClaimsIdentity.RoleClaimType =
                        OpenIdConnectConstants.Claims.Role;
                });

            // IIS Integration
            services
                .Configure<IISOptions>(options =>
                {
                });

            // Add cors
            services.AddCors();
            services.AddSignalR();
            services.AddMemoryCache();
            // Register the OpenIddict services.
            services
                .AddOpenIddict()
                .AddCore(options =>
                {
                    options
                        .UseEntityFrameworkCore()
                        .UseDbContext<ApplicationDbContext>();

                    /*options.AddEntityFrameworkCoreStores<ApplicationDbContext>();
                options.AddMvcBinders();
                options.EnableTokenEndpoint("/connect/token");
                options.AllowPasswordFlow();
                options.AllowRefreshTokenFlow();
                //options.UseJsonWebTokens();

                if (_hostingEnvironment.IsDevelopment()) //Uncomment to only disable Https during development
                    options.DisableHttpsRequirement();

                //options.UseRollingTokens(); //Uncomment to renew refresh tokens on every refreshToken request
                // options.AddSigningKey(new SymmetricSecurityKey(System.Text.Encoding.ASCII.GetBytes(Configuration["STSKey"]))); */
                })
                .AddServer(options =>
                {
                    // options.
                    options.UseMvc();

                    options.EnableTokenEndpoint("/connect/token");
                    options.SetAccessTokenLifetime(TimeSpan.FromHours(5));
                    options.SetRefreshTokenLifetime(TimeSpan.FromHours(5));
                    options.SetIdentityTokenLifetime(TimeSpan.FromHours(5));
                    options.AllowPasswordFlow();
                    options.AllowRefreshTokenFlow();

                    //Uncomment to only disable Https during development
                    options.DisableHttpsRequirement();

                    //disables requiring client_id
                    options.AcceptAnonymousClients();

                    options
                        .RegisterScopes(OpenIdConnectConstants.Scopes.OpenId,
                        OpenIdConnectConstants.Scopes.Email,
                        OpenIdConnectConstants.Scopes.Phone,
                        OpenIdConnectConstants.Scopes.Profile,
                        OpenIdConnectConstants.Scopes.OfflineAccess,
                        OpenIddictConstants.Scopes.Roles);
                });
            services
                .AddRouting(options =>
                {
                    options
                        .ConstraintMap
                        .Add(AuthorizationFields.RESPONDENT,
                        typeof(RespondentConstraint));
                });

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme =
                        OAuthValidationDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme =
                        OAuthValidationDefaults.AuthenticationScheme;
                })
                .AddOAuthValidation(options =>
                {
                    options.Events =
                        new OAuthValidationEvents
                        {
                            OnRetrieveToken =
                                context =>
                                {
                                    var accessToken =
                                        context.Request.Query["access_token"];

                                    if (
                                        !string.IsNullOrEmpty(accessToken) &&
                                        (
                                        context
                                            .HttpContext
                                            .WebSockets
                                            .IsWebSocketRequest ||
                                        context.Request.Headers["Accept"] ==
                                        "text/event-stream"
                                        )
                                    ) context.Token = accessToken;
                                    return Task.CompletedTask;
                                }
                        };
                });

            // Add framework services.
            services
                .AddMvc(option => option.EnableEndpointRouting = false)
                .AddNewtonsoftJson(opts =>
                {
                    opts.SerializerSettings.ReferenceLoopHandling =
                        ReferenceLoopHandling.Ignore;
                    opts.SerializerSettings.DateFormatHandling =
                        DateFormatHandling.IsoDateFormat;
                    opts.SerializerSettings.DateTimeZoneHandling =
                        DateTimeZoneHandling.Utc;
                    opts
                        .SerializerSettings
                        .Converters
                        .Add(new StringEnumConverter()
                        { NamingStrategy = new CamelCaseNamingStrategy() });
                    //  opts.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                });

            services.AddHttpContextAccessor();
            services
                .TryAddSingleton<IActionContextAccessor, ActionContextAccessor>(
                );

            // In production, the Angular files will be served from this directory
            if (_hostingEnvironment.IsDevelopment())
            {
                services
                    .AddSpaStaticFiles(configuration =>
                    {
                        configuration.RootPath = "../Traisi.ClientApp/dist";
                    });
            }
            else
            {
                services
                    .AddSpaStaticFiles(configuration =>
                    {
                        configuration.RootPath = "Traisi.ClientApp/dist";
                    });
            }

            // Enforce https during production. To quickly enable ssl during development. Go to: Project Properties->Debug->Enable SSL
            if (!_hostingEnvironment.IsDevelopment())
            {
                // services.Configure<MvcOptions> (options => options.Filters.Add (new RequireHttpsAttribute ()));
            }

            //Todo: ***Using DataAnnotations for validation until Swashbuckle supports FluentValidation***
            services
                .AddMvc()
                .AddFluentValidation(fv =>
                    fv.RegisterValidatorsFromAssemblyContaining<Startup>());

            services
                .AddCors(options =>
                    options
                        .AddPolicy("CorsPolicy",
                        builder =>
                        {
                            builder
                                .AllowAnyMethod()
                                .AllowAnyHeader()
                                .AllowAnyOrigin();
                        }));

            services
                .AddOpenApiDocument(document =>
                {
                    document
                        .AddSecurity("JWT",
                        Enumerable.Empty<string>(),
                        new NSwag.OpenApiSecurityScheme
                        {
                            Type = OpenApiSecuritySchemeType.ApiKey,
                            Name = "Authorization",
                            In = OpenApiSecurityApiKeyLocation.Header,
                            Description =
                                "Type into the textbox: Bearer {your JWT token}."
                        });

                    document
                        .OperationProcessors
                        .Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
                });

            /*
			services.AddSwaggerGen (c => {
				c.SwaggerDoc ("v1", new OpenApiInfo { Title = "TRAISI API", Version = "v1" });

				c.AddSecurityDefinition ("oauth2", new OpenApiSecurityScheme {
					Type = SecuritySchemeType.OAuth2,
						Flows = new OpenApiOAuthFlows
						{
							AuthorizationCode = new OpenApiOAuthFlow
                       		{
                           		AuthorizationUrl = new Uri("/auth-server/connect/authorize", UriKind.Relative),
                           		TokenUrl = new Uri("/auth-server/connect/token", UriKind.Relative),
								// TokenUrl = "/connect/token"
								Scopes = new Dictionary<string, string>
                            	{
                               		{ "readAccess", "Access read operations" },
                               		{ "writeAccess", "Access write operations" }
                           		}
							}
						}
					});
								
				c.AddSecurityRequirement (new OpenApiSecurityRequirement {
					{
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
                        },
                        new[] { "readAccess", "writeAccess" }
                    }
				
				});
			}); */
            services
                .AddAuthorization(options =>
                {
                    options
                        .AddPolicy(Policies.AccessAdminPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.AccessAdmin));

                    options
                        .AddPolicy(Policies.ViewAllUsersPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ViewUsers));
                    options
                        .AddPolicy(Policies.ManageAllUsersPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ManageUsers));
                    options
                        .AddPolicy(Policies.ManageAllGroupsPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ManageGroups));
                    options
                        .AddPolicy(Policies.ViewGroupUsersPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ViewGroupUsers));
                    options
                        .AddPolicy(Policies.ManageGroupUsersPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ManageGroupUsers));

                    options
                        .AddPolicy(Policies.ViewAllRolesPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ViewRoles));
                    options
                        .AddPolicy(Policies.ViewRoleByRoleNamePolicy,
                        policy =>
                            policy
                                .Requirements
                                .Add(new ViewRoleAuthorizationRequirement()));
                    options
                        .AddPolicy(Policies.ManageAllRolesPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ManageRoles));

                    options
                        .AddPolicy(Policies.AssignAllowedRolesPolicy,
                        policy =>
                            policy
                                .Requirements
                                .Add(new AssignRolesAuthorizationRequirement()));

                    options
                        .AddPolicy(Policies.ViewAllSurveysPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ViewSurveys));
                    options
                        .AddPolicy(Policies.ManageAllSurveysPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ManageSurveys));
                    options
                        .AddPolicy(Policies.ViewGroupSurveysPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ViewGroupSurveys));
                    options
                        .AddPolicy(Policies.ManageGroupSurveysPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.ManageGroupSurveys));
                    options
                        .AddPolicy(Policies.CreateGroupSurveysPolicy,
                        policy =>
                            policy
                                .RequireClaim(CustomClaimTypes.Permission,
                                AppPermissions.CreateGroupSurveys));

                    options
                        .AddPolicy(Policies.RespondToSurveyPolicy,
                        policy =>
                            policy
                                .Requirements
                                .Add(new SurveyRespondentAuthorizationRequirement()));
                });

            // use profiles in the assembly where the SurveyBuilder Profile is Located
            services
                .AddAutoMapper(Assembly
                    .GetAssembly(typeof(SurveyBuilderProfile)));

            // Mapper.Initialize(cfg => { cfg.AddProfile<AutoMapperProfile>(); });
            // Configurations
            services
                .Configure<SmtpConfig>(Configuration.GetSection("SmtpConfig"));
            services
                .Configure<MailgunConfig>(Configuration
                    .GetSection("MailgunConfig"));
            services
                .Configure<GeoConfig>(Configuration.GetSection("GeoConfig"));

            IList<CultureInfo> supportedCultures =
                new List<CultureInfo> {
                    new CultureInfo("en-CA"),
                    new CultureInfo("en"),
                    new CultureInfo("fr")
                };

            services
                .Configure<RequestLocalizationOptions>(options =>
                {
                    options.DefaultRequestCulture = new RequestCulture("en");
                    options.SupportedCultures = supportedCultures;
                    options.SupportedUICultures = supportedCultures;
                    options.RequestCultureProviders =
                        new List<IRequestCultureProvider> {
                            new QueryStringRequestCultureProvider(),
                            new CookieRequestCultureProvider()
                        };
                });

            // Business Services
            services.AddScoped<IEmailer, Emailer>();

            // Survey Code Generation Services
            services.AddScoped<ICodeGeneration, CodeGenerationService>();

            // File Downloader Services
            services.AddScoped<IFileDownloader, FileDownloaderService>();

            // Repositories
            services.AddScoped<IUnitOfWork, HttpUnitOfWork>();
            services.AddScoped<IAccountManager, AccountManager>();

            services.AddSingleton<SurveyCache>();

            // Auth Handlers
            services
                .AddSingleton
                <IAuthorizationHandler, ViewUserAuthorizationHandler>();
            services
                .AddSingleton
                <Microsoft.AspNetCore.Authorization.IAuthorizationHandler,
                    ManageUserAuthorizationHandler
                >();
            services
                .AddSingleton
                <IAuthorizationHandler, ViewGroupUserAuthorizationHandler>();
            services
                .AddSingleton
                <IAuthorizationHandler, ManageGroupUserAuthorizationHandler>();
            services
                .AddSingleton
                <IAuthorizationHandler, ViewRoleAuthorizationHandler>();
            services
                .AddSingleton
                <IAuthorizationHandler, AssignRolesAuthorizationHandler>();
            services
                .AddScoped
                <IAuthorizationHandler, SurveyRespondentAuthorizationHandler>();
            services
                .AddSingleton
                <IAuthorizationRequirement,
                    SurveyRespondentAuthorizationRequirement
                >();
            services.AddSingleton<IQuestionTypeManager, QuestionTypeManager>();
            services.AddSingleton<IExtensionsLoader, ExtensionsLoader>();
            services.AddSingleton<SurveyAuthenticationService>();
            services.AddScoped<AuthenticationService>();
            services
                .AddScoped<IRespondentGroupService, RespondentGroupService>();
            services
                .AddScoped<ISurveyRespondentService, SurveyRespondentService>();
            services.AddScoped<ISurveyViewerService, SurveyViewerService>();
            services.AddScoped<ISurveyResponseService, SurveyResponseService>();
            services
                .AddScoped<ISurveyValidationService, SurveyValidationService>();

            // add memory cache
            services.AddMemoryCache();

            // Persistent Business Services
            services.AddSingleton<IMailgunMailer, MailgunMailer>();

            // TODO (change based on config)
            if (Configuration.GetSection("GeoConfig")["Provider"] == "Google")
            {
                services.AddSingleton<IGeoServiceProvider, GoogleGeoService>();
            }
            else if (
                Configuration.GetSection("GeoConfig")["Provider"] ==
                "TRAISI.Helpers.MapBoxGeoService"
            )
            {
                services.AddSingleton<IGeoServiceProvider, MapboxGeoService>();
            }

            try
            {
                var providerName =
                    Type
                        .GetType(Configuration
                            .GetValue<string>("GeoConfig:Provider"));
                var addSingletonMethod = services.GetType().GetMethods();
                services
                    .AddSingleton(typeof(IGeoServiceProvider), providerName);
            }
            catch (Exception e)
            {
                Console
                    .WriteLine($"Unable to instantiate geoservice provider: ${e.Message}");
            }

            services.AddScoped<ISurveyBuilderService, SurveyBuilderService>();

            // DB Creation and Seeding
            services.AddTransient<IDatabaseInitializer, DatabaseInitializer>();
            services
                .AddLocalization(options =>
                    options.ResourcesPath = "Resources/Localization");

            services
                .AddHangfire(config =>
                {
                    config
                        .UsePostgreSqlStorage(Configuration["ConnectionStrings:DefaultConnection"]);
                });

            services
                .AddLogging(builder =>
                {
                    builder
                        .AddFilter("Microsoft.AspNetCore.SpaServices",
                        LogLevel.Information)
                        .AddConsole()
                        .AddDebug()
                        .AddConfiguration(Configuration.GetSection("Logging"))
                        .AddFilter("System", LogLevel.Warning)
                        .AddFilter("Microsoft", LogLevel.Warning)
                        .AddFilter("AspNet", LogLevel.Error)
                        .AddFilter("NToastNotify", LogLevel.Warning);
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(
            IApplicationBuilder app,
            IWebHostEnvironment env,
            ILoggerFactory loggerFactory,
            IQuestionTypeManager questionTypeManager
        )
        {
            // loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            // loggerFactory.AddDebug(LogLevel.Debug);
            loggerFactory.AddFile(Configuration.GetSection("Logging"));

            Utilities.ConfigureLogger(loggerFactory);
            EmailTemplates.Initialize(env, Configuration);

            questionTypeManager.LoadQuestionExtensions("extensions");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }
            app
                .UseForwardedHeaders(new ForwardedHeadersOptions
                {
                    ForwardedHeaders =
                        ForwardedHeaders.XForwardedFor |
                        ForwardedHeaders.XForwardedProto
                });

            //Configure Cors
            app.UseCors("CorsPolicy");
            app.UseSerilogRequestLogging();
            app.UseWebSockets();
            app.UseAuthentication();
            app.UseRouting();
            app.UseAuthorization();
            app
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                });
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseHangfireServer();
            app.UseHangfireDashboard();
            app.UseRequestLocalization();
            app.UseOpenApi();
            app.UseSwaggerUi3();
            Console.WriteLine("Is Development: " + env.IsDevelopment());
            app
                .UseMvc(routes =>
                {
                    routes
                        .MapRoute("default",
                        "{controller}/{action=Index}/{id?}");
                });

            app
                .MapWhen(p => !p.Request.Path.StartsWithSegments("/survey"),
                adminApp =>
                {
                    adminApp
                        .UseSpa(spa =>
                        {
                            // To learn more about options for serving an Angular SPA from ASP.NET Core,
                            // see https://go.microsoft.com/fwlink/?linkid=864501
                            spa.Options.SourcePath =
                                env.IsDevelopment()
                                    ? "../Traisi.ClientApp/"
                                    : "Traisi.ClientApp/";
                            spa.Options.StartupTimeout =
                                TimeSpan.FromSeconds(599);
                            spa.Options.DefaultPage = "/admin/index.html";

                            if (env.IsDevelopment() || env.IsStaging())
                                spa.UseAngularCliServer("start");
                        });
                });

            app
                .MapWhen(p => p.Request.Path.StartsWithSegments("/survey"),
                surveyApp =>
                {
                    surveyApp
                        .UseSpa(spa =>
                        {
                            // To learn more about options for serving an Angular SPA from ASP.NET Core,
                            // see https://go.microsoft.com/fwlink/?linkid=864501
                            spa.Options.SourcePath =
                                env.IsDevelopment()
                                    ? "../Traisi.ClientApp/"
                                    : "Traisi.ClientApp/";
                            spa.Options.DefaultPage = "/survey/index.html";
                            spa.Options.StartupTimeout =
                                TimeSpan.FromSeconds(599);

                            if (env.IsDevelopment() || env.IsStaging())
                            {
                                var angularConf =
                                    Configuration["survey-start-script"] == null
                                        ? DEFAULT_SURVEY_VIEWER_SPA_START_SCRIPT
                                        : Configuration["survey-start-script"];
                                spa.UseAngularCliServer(angularConf);
                            }
                        });
                });
        }
    }
}
