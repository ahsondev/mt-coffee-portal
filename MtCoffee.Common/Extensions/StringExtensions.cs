using System;
using System.Collections.Generic;
using System.Text;

namespace MtCoffee.Common.Extensions
{
    public static class StringExtensions
    {
        public static string ToCamelCase(this string str)
        {
            return string.IsNullOrEmpty(str) || str.Length < 2
            ? str
            : char.ToLowerInvariant(str[0]) + str.Substring(1);
        }

        /// <summary>
        /// <para>More convenient than using T.TryParse(string, out T). 
        /// Works with primitive types, structs, and enums.
        /// Tries to parse the string to an instance of the type specified.
        /// If the input cannot be parsed, null will be returned.
        /// </para>
        /// <para>
        /// If the value of the caller is null, null will be returned.
        /// So if you have "string s = null;" and then you try "s.ToNullable...",
        /// null will be returned. No null exception will be thrown. 
        /// </para>
        /// <author>Contributed by Taylor Love (Pangamma)</author>
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="p_self"></param>
        /// <returns></returns>
        public static T? ToNullable<T>(this string p_self) where T : struct
        {
            if (!string.IsNullOrEmpty(p_self))
            {
                var converter = System.ComponentModel.TypeDescriptor.GetConverter(typeof(T));
                if (converter.IsValid(p_self)) return (T) converter.ConvertFromString(p_self);
                if (typeof(T).IsEnum) { if (Enum.TryParse<T>(p_self, out T t)) return t; }
            }

            return null;
        }

        public static string ToHex(this char c)
        {
            return '%' + ((int) c).ToString("X2");
        }
    }
}
