using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace MtCoffee.Common
{
    public static class HashHelper
    {
        /// <summary>
        /// Uses default encryption password, as specified by environment key: PORTAL_MTCOFFEE_NET_PW.
        /// Or else a default value if key not present in environmental variables.
        /// </summary>
        /// <param name="unencrypted"></param>
        /// <returns></returns>
        public static string Sha256(this string message)
        {
            using (SHA256 mySHA256 = SHA256.Create())
            {
                var bOrig = Encoding.UTF8.GetBytes(message);
                var bNew = mySHA256.ComputeHash(bOrig);
                string chop = BitConverter.ToString(bNew).Replace("-", "");
                return chop;
            }
        }
    }
}
