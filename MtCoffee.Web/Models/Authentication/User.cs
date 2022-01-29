using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.Authentication
{
    public class User
    {
		public int? Id { get; set; }
		public string EmailAddress { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }

		public string PasswordHash { get; set; }
		public string PasswordSalt { get; set; }
    }
}
