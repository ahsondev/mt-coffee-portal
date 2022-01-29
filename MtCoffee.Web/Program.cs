using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MtCoffee.Web.Controllers;

namespace MtCoffee.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine($"Starting app at {DeploymentInfoController.DeploymentTime.Value}");
            //Environment.SetEnvironmentVariable("DOTNET_BUNDLE_EXTRACT_BASE_DIR", ".extract");
            CreateHostBuilder(args).Build().Run();

        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostingContext, config) =>
                {
                    string envName = hostingContext.HostingEnvironment.EnvironmentName;
                    if (envName == "Development")
                    {
                        config.AddJsonFile("appsettings.Development.json",
                            optional: false,
                            reloadOnChange: true);
                    }
                    else
                    {
                        config.AddJsonFile("appsettings.json",
                            optional: false,
                            reloadOnChange: true);;
                    }
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>()
                    .PreferHostingUrls(true)
                    .UseUrls(new string[] { "http://127.0.0.1:5002" });
                });
    }
}
