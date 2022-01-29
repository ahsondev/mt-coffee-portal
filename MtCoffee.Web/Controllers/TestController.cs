using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MtCoffee.Common;
using MtCoffee.Web.AppStart;
using MtCoffee.Web.Models;
using MtCoffee.Web.Models.Test;

namespace MtCoffee.Web.Controllers
{
    [Authorize]
    public class TestController : BaseApiController
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }


        //[HttpPost]
        //public JsonPayload<EncryptionViewModel> Encrypt([FromForm]string toEncrypt)
        //{
        //    var model = new EncryptionViewModel()
        //    {
        //        Content = toEncrypt,
        //        EncryptedContent = toEncrypt.EncryptAes()
        //    };

        //    return new JsonPayload<EncryptionViewModel>(model);
        //}


        [HttpGet]
        public IEnumerable<WeatherForecast> Error() => throw new Exception("Testing 1 2 3");


        [HttpGet]
        public string Range([Range(0,5)]int val)
        {
            return $"VAL = {val}";
        }

        [HttpGet]
        public string Echo(string a) => $"Echo: {a}";


        [HttpGet]
        public string GetConfig() {
            return Config.Instance.TestValue.Value;
        }
    }
}
