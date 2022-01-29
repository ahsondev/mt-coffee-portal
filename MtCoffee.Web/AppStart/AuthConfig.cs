using Dapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MtCoffee.Web.Models.Authentication;
using MySqlConnector;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MtCoffee.Web.AppStart
{

    public static class AuthConfig
    {
        internal static void AddAuthentication(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
             {
                 options.TokenValidationParameters = new TokenValidationParameters
                 {
                     ValidateIssuer = true,
                     ValidateAudience = true,
                     ValidateLifetime = true,
                     ValidateIssuerSigningKey = true,
                     ValidIssuer = Config.Instance.JWT_Issuer.Value,
                     ValidAudience = Config.Instance.JWT_Issuer.Value,
                     IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Config.Instance.JWT_Key.Value))
                 };

                 options.Events = new JwtBearerEvents()
                 {
                     OnMessageReceived = (context) =>
                     {
                         if (context.Request.Cookies.TryGetValue(Constants.AuthTokenCookieName, out string value))
                         {
                             context.Token = value;
                         }
                         else if (context.Request.Headers.TryGetValue(Constants.AuthTokenHeaderName, out StringValues hVal))
                         {
                             context.Token = hVal.FirstOrDefault();
                         }

                         return Task.CompletedTask;
                     },
                     OnTokenValidated = async (context) =>
                     {
                         var userId = context.Principal.Claims.FirstOrDefault(claim => claim.Type == Constants.CLAIM_USERID)?.Value;
                         var claims = new List<Claim>();
                         using (var conn = new MySqlConnection(Config.Instance.SqlConnectionString.Value))
                         {
                             var userRs = await conn.QueryMultipleAsync("SELECT * FROM users WHERE id = @Id;" +
                                 " SELECT `organizationId` FROM `organization_users` WHERE userId = @Id; " +
                                 " SELECT `name` FROM roles r INNER JOIN user_roles ur ON ur.roleId = r.Id WHERE ur.userId = @Id;", new { Id = userId });

                             User found = userRs.Read<User>().FirstOrDefault();
                             List<int> organizationIds = userRs.Read<int>().ToList();
                             List<string> roles = userRs.Read<string>().ToList();

                             if (found != null)
                             {
                                 claims.Add(new Claim(ClaimTypes.Email, found.EmailAddress));
                                 claims.Add(new Claim(ClaimTypes.Upn, found.EmailAddress));
                                 claims.Add(new Claim(ClaimTypes.Role, string.Join(",", roles)));
                                 claims.Add(new Claim(ClaimTypes.GivenName, found.FirstName));
                                 claims.Add(new Claim(ClaimTypes.Surname, found.LastName));
                                 claims.Add(new Claim(Constants.CLAIM_ORGANIZATION_ID, JsonConvert.SerializeObject(organizationIds)));
                             }
                         }

                         context.Principal.AddIdentity(new System.Security.Claims.ClaimsIdentity(claims));
                     },
                     OnAuthenticationFailed = (context) =>
                     {
                         var ex = context.Exception;
                         return Task.CompletedTask;
                     },
                     OnChallenge = (context) =>
                     {

                         return Task.CompletedTask;
                     }

                 };
             });
        }
    }
}
