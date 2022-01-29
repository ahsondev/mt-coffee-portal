using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace MtCoffee.Common
{
    public static class AESEncryptionHelperExtension
    {
        /// <summary>
        /// Uses default encryption password, as specified by environment key: PORTAL_MTCOFFEE_NET_PW.
        /// Or else a default value if key not present in environmental variables.
        /// </summary>
        /// <param name="unencrypted"></param>
        /// <returns></returns>
        public static string EncryptAes(this string unencrypted)
        {
            return AESEncryptionHelper.Instance.Encrypt(unencrypted);
        }

        /// <summary>
        /// Uses default encryption password, as specified by environment key: PORTAL_MTCOFFEE_NET_PW.
        /// Or else a default value if key not present in environmental variables.
        /// </summary>
        /// <param name="encrypted"></param>
        /// <returns></returns>
        public static string DecryptAes(this string encrypted)
        {
            return AESEncryptionHelper.Instance.Decrypt(encrypted);
        }
    }

    /// <summary>
    /// A symmetric key encryption utility.
    /// </summary>
    public class AESEncryptionHelper
    {
        //Never changes the key or vector, or data previously encrypted will never* be able to be unencrypted.

        private static readonly byte[] m_key = { 123, 217, 19, 77, 24, 26, 85, 45, 114, 184, 27, 162, 37, 112, 222, 249, 241, 24, 175, 144, 173, 53, 196, 29, 240, 26, 175, 218, 134, 236, 53, 209 };  //32
        private static readonly byte[] m_vector = { 78, 89, 85, 52, 12, 23, 98, 87, 74, 41, 12, 23, 122, 32, 114, 156 };  //16
        private readonly ICryptoTransform m_encryptor = null;
        private readonly ICryptoTransform m_decryptor = null;
        private readonly UTF8Encoding m_encoder = null;

        public static AESEncryptionHelper Instance = new AESEncryptionHelper(null);

        public AESEncryptionHelper(string password = null)
        {
            if (password == null) password = EnvironmentHelper.GetEnvironmentVariable("PORTAL_MTCOFFEE_NET_PW");

            byte[] v_key = (password != null) ? this.MD5Hash(password) : m_key;

            RijndaelManaged rm = new RijndaelManaged();
            m_encryptor = rm.CreateEncryptor(v_key, m_vector);
            m_decryptor = rm.CreateDecryptor(v_key, m_vector);
            m_encoder = new UTF8Encoding();
        }

        private byte[] MD5Hash(string message)
        {
            return MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(message));
        }

        public string Encrypt(string unencrypted)
        {
            return Convert.ToBase64String(this.Encrypt(m_encoder.GetBytes(unencrypted)));
        }

        public string Decrypt(string encrypted)
        {
            return m_encoder.GetString(this.Decrypt(Convert.FromBase64String(encrypted)));
        }

        public byte[] Encrypt(byte[] buffer)
        {
            return this.Transform(buffer, m_encryptor);
        }

        public byte[] Decrypt(byte[] buffer)
        {
            return this.Transform(buffer, m_decryptor);
        }

        public void NormalizeInput(ref string value)
        {
            //+ is a valid Base64-encoded character, but ASP.NET MVC routing URL decodes this upstream in the pipeline and the value handed to this action contains a space.
            if (!String.IsNullOrEmpty(value))
            {
                value = value.Replace(" ", "+");
            }
        }

        protected byte[] Transform(byte[] buffer, ICryptoTransform transform)
        {
            using (MemoryStream stream = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(stream, transform, CryptoStreamMode.Write))
                {
                    cs.Write(buffer, 0, buffer.Length);
                }

                return stream.ToArray();
            }
        }

    }
}
