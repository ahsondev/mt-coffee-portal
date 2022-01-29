using MtCoffee.Web.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.GiftCard
{
    public enum GiftCardScanType
    {
        Phone = 0,

        /// <summary>
        /// Manual
        /// </summary>
        PrimaryAccountNumber = 1,
        MagneticCardSwipeFormatB = 2,
    }

    /// <summary>
    /// https://en.wikipedia.org/wiki/Magnetic_stripe_card#Financial_cards
    /// 
    /// </summary>
    public class GiftCardHelper
    {
        public static string GetPrimaryAccountNumberFromSwipe(string scan)
        {
            if (scan.StartsWith("%B"))
            {
                scan = scan.Substring(2);
                return scan.Split("^").FirstOrDefault();
            }

            return null;
        }
        public static GiftCardScanType GetScanType(string scan)
        {
            if (scan.StartsWith("%B") && scan.IndexOf(';') > -1)
            {
                return GiftCardScanType.MagneticCardSwipeFormatB;
            }
            else if (scan.Length <= "+1-425-943-1598".Length && scan.Count(c => Char.IsDigit(c)) == 11)
            {
                return GiftCardScanType.Phone;
            }
            else // Manual Entry
            {
                return GiftCardScanType.PrimaryAccountNumber;
            }
        }
    }
}
