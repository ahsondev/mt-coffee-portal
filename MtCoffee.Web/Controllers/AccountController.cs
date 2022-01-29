using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MtCoffee.Web.Models.Authentication;
using MtCoffee.Web.AppStart;
using System.Net.Http;
using MtCoffee.Web.Models;
using Microsoft.Net.Http.Headers;
using MtCoffee.Common;
using Dapper;
using System.Net;
using MtCoffee.Common.Extensions;

namespace MtCoffee.Web.Controllers
{
    [Authorize]
    public class AccountController : BaseApiController
    {
        private IConfiguration _config;

        public AccountController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<JsonPayload<UserLoginResult>> Login([FromBody] UserLogin login)
        {
            JsonPayload<UserLoginResult> result = new JsonPayload<UserLoginResult>();
            var user = await AuthenticateUser(login);
            result.Errors.AddRange(user.Errors);
            result.StatusCode = user.StatusCode;

            if (user != null && user.IsSuccess)
            {
                var tokenString = GenerateJSONWebToken(user.Payload, login.RememberMe);
                var rs = new UserLoginResult()
                {
                    JwtToken = tokenString
                };

                result.Payload = rs;

                var cookie = new CookieHeaderValue(Constants.AuthTokenCookieName, tokenString);
                string domain = this.getDomainForCookie();

                //TODO: Figure out how to get this to actually work properly so logout works correctly.
                Response.Cookies.Append(Constants.AuthTokenCookieName, tokenString, new Microsoft.AspNetCore.Http.CookieOptions()
                {
                    Expires = login.RememberMe ? DateTime.Now.AddMonths(12) : DateTime.Now.AddHours(18),
                    Path = "/",
                    Domain = domain,
                    IsEssential = true,
                    Secure = true,
                    HttpOnly = false
                });
            }

            return result;
        }

        private string getDomainForCookie()
        {
            string domain = Request.Host.Value;

            if (Request.Headers.TryGetValue("Origin", out Microsoft.Extensions.Primitives.StringValues value))
            {
                var derp = new Uri(value.First());
                // TODO: Is this a security vulnerability here?
                var originHost = value.Select(v => new Uri(v).Host).FirstOrDefault();
                if (!string.IsNullOrEmpty(originHost) && originHost != domain)
                {
                    domain = originHost;
                }
            }

            return domain;
        }

        [HttpGet]
        [AllowAnonymous]
        public bool Logout()
        {
            Response.Cookies.Delete(Constants.AuthTokenCookieName, new Microsoft.AspNetCore.Http.CookieOptions()
            {
                Domain = this.getDomainForCookie(),
                IsEssential = true,
                Path = "/"
            });
            return true;
        }

        [HttpGet]
        [AllowAnonymous]
        public JsonPayload<bool> IsAuthenticated()
        {
            bool isAuthenticated = this.HttpContext.User?.Identity?.IsAuthenticated ?? false;
            return new JsonPayload<bool>(isAuthenticated);
        }

        [HttpGet]
        public JsonPayload<UserProfile> GetUserProfile()
        {
            var user = UserProfile.FromClaims(this.HttpContext.User.Claims ?? new List<Claim>());
            return new JsonPayload<UserProfile>(user);
        }

        [HttpGet]
        [AllowAnonymous]
        public JsonPayload<PermissionSet> GetPermissions()
        {
            var claims = HttpContext.User?.Claims ?? new List<Claim>();
            var roleCsv = claims.FirstOrDefault(clm => clm.Type == ClaimTypes.Role)?.Value ?? "";
            bool isAuthenticated = this.HttpContext.User?.Identity?.IsAuthenticated ?? false;
            return new JsonPayload<PermissionSet>(new PermissionSet(roleCsv)
            {
                IsAuthenticated = isAuthenticated
            });
        }

        [HttpGet]
        [AllowAnonymous]
        public string GetPermissionTypescriptFile()
        {
            string content = "export interface PermissionSet {\r\n";
            content += "    roles: string[];\r\n";
            content += "    isAuthenticated: boolean;\r\n";
            foreach (var permKey in Permissions.Keys)
            {
                content += "    " + permKey.ToCamelCase() + ": boolean;\r\n";
            }
            content += "}";

            return content;
        }

        private string GenerateJSONWebToken(UserProfile userInfo, bool isRememberMe)
        {
            var jwtKey = Config.Instance.JWT_Key.Value;
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var expire = isRememberMe ? DateTime.Now.AddYears(1) : DateTime.Now.AddHours(18);
            var claims = userInfo.ToClaims();

            var token = new JwtSecurityToken(Config.Instance.JWT_Issuer.Value, // issuer
              Config.Instance.JWT_Issuer.Value, // audience
              claims,
              expires: expire,
              signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<JsonPayload<UserProfile>> AuthenticateUser(UserLogin login)
        {
            using (var conn = this.GetConnection())
            {
                var userMatches = await conn.QueryAsync<User>("SELECT * FROM users WHERE passwordHash IS NOT NULL AND emailAddress = @Email limit 10", login);
                User found = userMatches.Where(match =>
                {
                    string toHash = (match.PasswordSalt ?? "") + login.Password;
                    string hashed = HashHelper.Sha256(toHash);
                    return match.PasswordHash == hashed;
                }).FirstOrDefault();

                if (found == null)
                {
                    Response.StatusCode = (int) HttpStatusCode.Unauthorized;
                    return new JsonPayload<UserProfile>(null, "Username and password do not match to an existing user.")
                    {
                        StatusCode = ResponseStatusCode.INVALID_USER
                    };
                }

                var roles = await conn.QueryAsync<string>("SELECT `name` FROM roles r INNER JOIN user_roles ur ON ur.roleId = r.Id WHERE ur.userId = @UserId", new { UserId = found.Id });
                var userProfile = new UserProfile()
                {
                    EmailAddress = found.EmailAddress,
                    Roles = roles.ToList(),
                    UserId = found.Id,
                    FirstName = found.FirstName,
                    LastName = found.LastName
                };

                return new JsonPayload<UserProfile>(userProfile);
            }
        }
    }
}
