using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Traisi.Data;

namespace Traisi
{
    public class
    DesignTimeDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Mapper.Reset();
            IConfigurationRoot configuration;
            var cb =
                new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json");

            if (File.Exists("appsettings.local.json"))
            {
                cb.AddJsonFile("appsettings.local.json");
            }
            else
            {
                cb.AddJsonFile("appsettings.json", optional: true);
            }
            configuration = cb.Build();
            var builder = new DbContextOptionsBuilder<ApplicationDbContext>();

            Boolean
                .TryParse(configuration
                    .GetSection("DevelopmentSettings")
                    .GetSection("UseSqliteDatabaseProvider")
                    .Value,
                out bool development);

            builder
                .UseNpgsql(configuration["ConnectionStrings:DefaultConnection"],
                b =>
                {
                    b.MigrationsAssembly("Traisi");
                    b.UseNetTopologySuite();
                });

            builder.UseOpenIddict();

            return new ApplicationDbContext(builder.Options);
        }
    }
}
