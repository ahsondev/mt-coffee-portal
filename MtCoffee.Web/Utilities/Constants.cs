using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web
{
    public static class Constants
    {
        public const string AuthTokenCookieName = "jwt-auth-token";
        public const string AuthTokenHeaderName = "x-jwt-auth-token";
        private const string CLAIM_PREFIX = "COFFEE-POS-";
        public static readonly string CLAIM_USERID = $"{Constants.CLAIM_PREFIX}_UserId";
        public static readonly string CLAIM_ORGANIZATION_ID = $"{Constants.CLAIM_PREFIX}_OrganizationId";
    }
}
