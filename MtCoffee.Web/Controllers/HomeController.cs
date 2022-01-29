using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MtCoffee.Web.Controllers
{
    public class HomeController : Controller 
    { 
        [HttpGet]
        public string Index() => "AAAAABCDDD";
    }
}
