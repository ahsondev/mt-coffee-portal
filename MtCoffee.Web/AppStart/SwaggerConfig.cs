using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.AppStart
{

    public class SwaggerConfig
    {
        public static void AddSwaggerGen(SwaggerGenOptions c)
        {
            c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "CoffeeShop POS", Version = "v1" });
            c.ResolveConflictingActions(apiDesc =>
            {
                return apiDesc.First();
            });
        }

        public static void UseSwaggerUI(SwaggerUIOptions c)
        {
            c.SwaggerEndpoint("v1/swagger.json", "v1");
            c.ShowCommonExtensions();
            c.DocExpansion(DocExpansion.None);
            c.DocumentTitle = "Coffeeshop POS";
        }
    }
}
