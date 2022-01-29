using MtCoffee.Web.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.GiftCard
{
    /// <summary>
    /// https://en.wikipedia.org/wiki/Magnetic_stripe_card#Financial_cards
    /// </summary>
    public class GiftCardInfo
    {
        public int? ID { get; set; }
        public string Phone { get; set; }
        public string PhoneFormatted { get; set; }
        public double Points { get; set; } = 0;
        public double Money { get; set; } = 0;
    }

    public class GiftCardDTO
    {
        public int? ID { get; set; }
        public string Phone { get; set; }
        public string CardSwipe { get; set; }
        public string PrimaryAccountNumber { get; set; }
        public double Points { get; set; } = 0;
        public double Balance { get; set; } = 0;
    }
}
