//    Copyright 2018
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Traisi.Data;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using Traisi.Helpers;

namespace Traisi {
	public class Program {
		/// <summary>
		/// 
		/// </summary>
		/// <param name="args"></param>
		public static int Main (string[] args) {
			var logger = BuildLogger ();
			try {
				var host = BuildWebHost (args);
				using (var scope = host.Services.CreateScope ()) {
					var services = scope.ServiceProvider;

					try {
						var databaseInitializer = services.GetRequiredService<IDatabaseInitializer> ();
						databaseInitializer.SeedAsync ().Wait ();
					} catch (Exception ex) {
						logger.Fatal (ex, LoggingEvents.INIT_DATABASE.Name);
						return 1;
					}
				}

				host.Run ();
				return 0;
			} catch (Exception ex) {
				logger.Fatal(ex,"A fatal error occured, TRAISI is shutting down.");
				Log.CloseAndFlush();
				return 1;
			}
		}

		/// <summary>
		/// 
		/// </summary>
		/// <returns></returns>
		private static Serilog.ILogger BuildLogger () {
			Log.Logger = new LoggerConfiguration ()
				.MinimumLevel.Information ()
				.MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
				.Enrich.FromLogContext ()
				.WriteTo.Console ()
				.CreateLogger ();
			return Log.Logger;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="args"></param>
		/// <returns></returns>
		public static IWebHost BuildWebHost (string[] args) {

			var builder = WebHost.CreateDefaultBuilder (args)
				.UseSerilog ()
				.UseStartup<Startup> ()
				.ConfigureAppConfiguration ((hostingContext, config) => {
					if (args.Contains ("--config")) {
						int index = Array.IndexOf (args,"--config");
						if (index + 1 <= args.Length - 1 && File.Exists (args[index + 1])) {

							Console.WriteLine ("Loading config file: " + args[index + 1]);
							config.AddJsonFile (args[index + 1]);
						}
					} else {
						// add local configuration if file exists, not tracked in repository
						if (File.Exists ("appsettings.local.json")) {
							config.AddJsonFile ("appsettings.local.json");
						}
					}
					config.AddCommandLine (args);
				});

			bool isEnvironmentTest = false;

			bool.TryParse (Environment.GetEnvironmentVariable ("TRAISI_STAGING_TEST"), out isEnvironmentTest);
			if (args.Contains ("--test") || isEnvironmentTest) {
				builder.UseEnvironment ("Development");
				//.UseKestrel ((options) => {
				//	options.Listen (IPAddress.Any, 8000);
				//});
			}

			Console.WriteLine ($"ASPNETCORE_ENVIRONMENT: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}");
			return builder.Build ();
		}
	}
}