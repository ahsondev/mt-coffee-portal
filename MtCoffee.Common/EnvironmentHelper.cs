using System;
using System.Collections.Generic;
using System.Text;

namespace MtCoffee.Common
{
    public class EnvironmentHelper
    {
        /**
         * Checks ALL environment locations
         */
        public static string GetEnvironmentVariable(string key)
        {
            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process)
             ?? Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.User)
             ?? Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Machine);
        }
    }
}
