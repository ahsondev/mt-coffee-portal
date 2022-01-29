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
    /// 
    /// </summary>
    public class GiftCardTransaction
    {
        #region Constructor
        public GiftCardTransaction() { }

        public GiftCardTransaction(string scan)
        {
            this.ScanCardData(scan);
        }

        public GiftCardTransaction(string scan, GcTransactionType type)
        {
            this.ScanCardData(scan);
            this.TransactionCode = type;
        }

        #endregion Constructor

        #region Properties
        
        /// <summary>
        /// G, G0,G1
        /// "G1" was recommended by the onboarding person.
        /// </summary>

        [StringRange("G", "G0", "G1")]
        public string EdcType { get; set; } = "G1";
        public GcTransactionType TransactionCode { get; set; } = GcTransactionType.BalanceInquiry;

        /// <summary>
        /// 1 = retail
        /// 2 = restaurant
        /// </summary>
        [StringRange("2","1")]
        public string IndustryCode { get; set; } = "2";

        /// <summary>
        /// Variable length field; null if card number is manually entered.
        /// </summary>
        public string Track1Data { get; set; } = "B3862554803936615^^0000";

        /// <summary>
        /// Card # (may be followed by '=' and more data which server ignores)
        /// </summary>
        public string Track2Data { get; set; } = "3862554803936615=0000";

        /// <summary>
        /// 0 or blank: Formatted by terminal; Nonzero: Raw data.
        /// </summary>
        public string Track2FormatCode { get; set; } = "0";


        public string Track3Data => ""; // Optional?

        /// <summary>
        /// Store location ID (4 digits)
        /// </summary> 
        [MaxLength(4)]
        [MinLength(4)]
        public string LID => "0003";

        /// <summary>
        /// Terminal ID (4 digits)
        /// </summary> 
        [MaxLength(4)]
        [MinLength(4)]
        public string TID => "0001";

        /// <summary>
        /// "Reserved", but for WHAT?
        /// e.g., O3750, Vx570, N8320, N8400, N8010, N2085.
        /// </summary>
        public string TerminalType = "";
        public string TerminalAppVersion = "";

        /// <summary>
        /// Merchant ID
        /// </summary> 
        [MaxLength(7)]
        [MinLength(7)]
        public string MID => "0004945";
        public string CommunicationType => "41";

        public string TimeZone => "PST";


        /// <summary>
        /// (G) Optional; (G1) 0: Other; 1: Magnetic; 2: Manual; 3: Barcode; 4: Contact-less.
        /// </summary>
        public string EntryMode { get; set; } = "1";

        public DateTime DateTime { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Transaction amount in cents, variable # of digits, no decimal point
        /// or
        /// Number of points x100
        /// </summary>
        public int? AmountT1 { get; set; }

        public string Text { get; set; }

        #endregion Properties

        #region Card scanning + Helper Functions
        /// <summary>
        /// Prints out the payload that should be sent to the API
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            const string STX = "%02";
            const string ETX = "%03";

            string sep = "%1C"; // separator
            string[] parts = new string[] {
                EdcType,
                TransactionCode.Value,
                Track1Data,
                Track2Data, Track2FormatCode,
                Track3Data,
                "", // User Pin (Ignored)
                MID,
                LID,
                $"{MID}{LID}{TID}",
                CommunicationType,
                TerminalType,
                TerminalAppVersion,
                TimeZone,
                IndustryCode,
                "M&TCoffeeSerialCode".GetHashCode().ToString(),
                EntryMode,

                "", // rule ID (ignored)
                "", // ItemNumber (ignored)
                "", // Cashier / Clerk (ignored)
                this.DateTime.ToString("yyyy-MM-dd"), // Date
                this.DateTime.ToShortTimeString(), // Time
                "", // TransactionID
                AmountT1 != null ? AmountT1.ToString() : "",
                "", // AmountT2 (tips) 
                Text
            };

            string rt = string.Join(sep, parts);

            return STX + rt + ETX;
            //rs += "%03";
        }

        /// <summary>
        /// Scans in the card data and modifies the transaction object. Then returns the same transaction
        /// object for command chaining.
        /// </summary>
        /// <param name="scan"></param>
        public GiftCardTransaction ScanCardData(string scan)
        {
            this.ReadScannedCard(scan, out string Track1Data, out string Track2Data, out string EntryMode);
            this.Track1Data = Track1Data;
            this.Track2Data = Track2Data;
            this.EntryMode = EntryMode;
            return this;
        }

        private void ReadScannedCard(string scan, out string Track1Data, out string Track2Data, out string EntryMode)
        {
            if (scan.StartsWith("%B"))
            {
                EntryMode = "1"; // Magnetic card swipe
                int s = scan.IndexOf("%") + 1;
                int f = scan.IndexOf("?", s);
                int len = f - s;

                Track1Data = scan.Substring(s, len);

                s = scan.IndexOf(";", f) + 1;
                f = scan.IndexOf("?", s);
                len = f - s;

                Track2Data = scan.Substring(s, len);
            }
            else // Manual Entry
            {
                EntryMode = "2";
                Track1Data = "";
                Track2Data = scan;
            }
        }

        #endregion Card scanning
    }
}
