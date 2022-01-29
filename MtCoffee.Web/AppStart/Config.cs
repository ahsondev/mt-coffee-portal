using Microsoft.Extensions.Configuration;
using MtCoffee.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.AppStart
{
    public class Config
    {
        public IConfiguration ConfigurationFile { get; set; }
        public static Config Instance { get; set; } = null;
        public Lazy<string> TestValue { get; set; } = new Lazy<string>(() => Config.Instance["TestValue"]);
        public Lazy<string> JWT_Issuer { get; set; } = new Lazy<string>(() => Config.Instance["JWT_Issuer"]);
        public Lazy<string> JWT_Key { get; set; } = new Lazy<string>(() => Config.Instance["JWT_Key"].DecryptAes());
        public Lazy<string> SqlConnectionString { get; set; } = new Lazy<string>(() => Config.Instance["SqlConnectionString"].DecryptAes());

        public Config(IConfiguration confFile)
        {
            this.ConfigurationFile = confFile;
        }

        public string this[string key]
        {
            get => Config.Instance.ConfigurationFile.GetSection("AppSettings")[key];
        }
    }
}
