using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using MtCoffee.Web.AppStart;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MtCoffee.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            Config.Instance = new Config(configuration);
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

#if !DEBUG 
            // In production, the React files will be served from this directory  
            // Add static files  BEFORE adding routing calls.
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
#endif

            // Must be added before MVC
            AuthConfig.AddAuthentication(services);

            services.AddMvc(options =>
            {
                options.EnableEndpointRouting = false;
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.IgnoreNullValues = true;
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                //options.JsonSerializerOptions.PropertyNamingPolicy = null;
                options.JsonSerializerOptions.WriteIndented = true;
            });

            services.AddSwaggerGen(SwaggerConfig.AddSwaggerGen);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // https://stackoverflow.com/a/43878365/1582837
            var forwardedHeadersOptions = new ForwardedHeadersOptions { ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto, RequireHeaderSymmetry = false };
            forwardedHeadersOptions.KnownNetworks.Clear();
            forwardedHeadersOptions.KnownProxies.Clear();

            app
                .UseForwardedHeaders()
                .UseHttpsRedirection()
                .UseCors(builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod())
                .UseMiddleware<ErrorHandler>()
                .UseAuthentication() // Must be added before MVC
                .UseStaticFiles()   // Add static files  BEFORE adding routing calls.

#if !DEBUG
                .UseSpaStaticFiles()
#endif
                ;

            app.UseWhen((context) => context.Request.Path.Value.ToLower().StartsWith("/api"),
                configWhen => configWhen.UseMvc((Microsoft.AspNetCore.Routing.IRouteBuilder routes) =>
                {
                    routes.MapRoute(
                        name: "specific-api-route",
                        template: "api/{controller}/{action?}/{id?}",
                        defaults: new { controller = "DeploymentInfo", action = "Index" }
                    );

                    routes.MapRoute(
                        name: "default-api-route",
                        template: "api",
                        defaults: new { controller = "DeploymentInfo", action = "Index" }
                    );
                }
            ));


#if !DEBUG
            app.UseWhen((context) =>
            !context.Request.Path.Value.ToLower().StartsWith("/api")
            && !context.Request.Path.Value.ToLower().StartsWith("/swagger"),
                configWhen => configWhen.UseSpa(spa =>
                {
                    spa.Options.SourcePath = "ClientApp";

                    //if (env.IsDevelopment())
                    //{
                    //    spa.UseReactDevelopmentServer(npmScript: "start");
                    //}
                }
            ));
#endif

            if (true || env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(SwaggerConfig.UseSwaggerUI);
            }
        }
    }
}
