using MtCoffee.Common.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MtCoffee.Web.Models.GiftCard
{
    public class GiftCardTransactionResponse
    {
        /// <summary>
        /// 503 = Declined
        /// 502 = Success
        /// 501 = Info
        /// </summary>
        public string ResultCode { get; set; }
        public bool IsSuccess => ResultCode != "503";

        // 6 chars
        public string TransactionId { get; set; }

        /// <summary>
        /// Reserved, null
        /// </summary>
        public string RuleId { get; set; }


        /// <summary>
        /// Amount of transaction (input)
        /// </summary>
        public double? TransactionAmount { get; set; }

        /// <summary>
        /// Amount AFTER transaction (output)
        /// </summary>
        public double? CardBalanceAfterTransaction { get; set; }

        /// <summary>
        /// <list type="bullet">
        /// <item>000     No Error Transaction Approved</item>
        /// <item>001     Invalid Account Id Operation Failed. No such card</item>
        /// <item>002     Account Not Active Operation Failed. Card not active</item>
        /// <item>003     Invalid Currency Operation Failed. Wrong Currency</item>
        /// <item>004     Invalid Account Type Cannot operate in this Group (wrong Group ID)</item>
        /// <item>005     Invalid Vendor Id Cannot operate in this Store (wrong store ID)</item>
        /// <item>006     Empty Password Operation Failed. Missing Password</item>
        /// <item>007     Password Not Correct Operation Failed. Wrong Password. Try Again</item>
        /// <item>008     Too Many Wrong Passwords Operation Failed. Wrong Passwords, Call for Support.</item>
        /// <item>009     Card Already Active Operation Failed. Card Already Active</item>
        /// <item>010     Transaction Already Canceled Operation Failed. Transaction Already Canceled</item>
        /// <item>011     Transaction Not Found Transaction ID not valid</item>
        /// <item>012     Card Expired Operation Failed. Card has expired</item>
        /// <item>013     Server Error Call Merchant support014 Card Cannot be Activated Bad Check Digit</item>
        /// <item>015     Invalid Terminal ID Terminal ID not in the database</item>
        /// <item>016     Malformed Request Request packet is malformed; Declined</item>
        /// <item>100     No Funds; Declined No Funds on Card; Card Declined</item>
        /// <item>101     Insufficient Funds Allow transaction, set balance to zero, and terminal will provide split payment feature</item>
        /// </list>
        /// </summary>
        public int? DeclineReason { get; set; }

        public string Text { get; set; }

        private GiftCardTransactionResponse()
        {
        }

        public static GiftCardTransactionResponse FromString(string line)
        {
            string[] parts = line.Replace("%02", "").Replace("%03", "").Split("%1C");
            int i = 0;
            var trans = new GiftCardTransactionResponse()
            {
                ResultCode = parts[i++],
                TransactionId = parts[i++],
                RuleId = parts[i++],
                TransactionAmount = parts[i++].ToNullable<double>(),
                CardBalanceAfterTransaction = parts[i++].ToNullable<double>(),
                DeclineReason = parts[i++].ToNullable<int>(),
                Text = HttpUtility.UrlDecode(parts[i++])
            };

            return trans;
        }
    }
}
