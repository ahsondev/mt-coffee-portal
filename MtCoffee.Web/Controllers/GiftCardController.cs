using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtCoffee.Common.Extensions;
using MtCoffee.Web.Models;
using MtCoffee.Web.Models.GiftCard;
using MtCoffee.Web.Models.Product;

namespace MtCoffee.Web.Controllers
{
    [Authorize]
    public class GiftCardController : BaseApiController
    {
        private string url = $"https://giftcardserver.com/isapi/gcard.dll";
        public GiftCardController()
        {
        }

        [HttpPost]
        public async Task<JsonPayload<double>> ActivateCard([FromForm] string scan, [FromForm] int? Amount)
        {
            var transaction = new GiftCardTransaction(scan, GcTransactionType.ActivateCard)
            {
                AmountT1 = Amount
            };

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        /// <summary>
        /// Adds money value to the card.
        /// </summary>
        /// <param name="scan"></param>
        /// <param name="Amount">Number of points</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<JsonPayload<double>> AddPoints([FromForm] string scan, [FromForm] int? Amount)
        {
            var transaction = new GiftCardTransaction(scan, GcTransactionType.AddPoints)
            {
                AmountT1 = Amount
            };

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        [HttpPost]
        public async Task<JsonPayload<double>> SetPoints([FromForm] string scan, [FromForm] int? Amount)
        {
            var exist = await this.BalancePoints(scan);
            if (!exist.IsSuccess) return exist;

            GiftCardTransaction transaction;
            if (Amount > exist.Payload)
            {
                transaction = new GiftCardTransaction(scan, GcTransactionType.AddPoints)
                {
                    AmountT1 =  (Amount ?? 0) - (int)exist.Payload
                };
            }
            else
            {
                transaction = new GiftCardTransaction(scan, GcTransactionType.RedeemPoints)
                {
                    AmountT1 = (int)exist.Payload - (Amount ?? 0)
                };
            }

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        [HttpPost]
        public async Task<JsonPayload<double>> SetValue([FromForm] string scan, [FromForm] int? Amount)
        {
            var exist = await this.BalanceMoney(scan);
            if (!exist.IsSuccess) return exist;

            GiftCardTransaction transaction;
            if (Amount > exist.Payload)
            {
                transaction = new GiftCardTransaction(scan, GcTransactionType.AddValue)
                {
                    AmountT1 = (Amount ?? 0) - (int)exist.Payload
                };
            }
            else
            {
                transaction = new GiftCardTransaction(scan, GcTransactionType.Redeem)
                {
                    AmountT1 = (int)exist.Payload - (Amount ?? 0)
                };
            }

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        /// <summary>
        /// Adds money value to the card.
        /// </summary>
        /// <param name="scan"></param>
        /// <param name="Amount">Number in cents. No decimal.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<JsonPayload<double>> AddValue([FromForm] string scan, [FromForm] int? Amount)
        {
            var transaction = new GiftCardTransaction(scan, GcTransactionType.AddValue)
            {
                AmountT1 = Amount
            };

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        [HttpPost]
        public async Task<JsonPayload<double>> RemovePoints([FromForm] string scan, [FromForm] int? Amount)
        {
            var existingBalance = await this.BalancePoints(scan);
            if (!existingBalance.IsSuccess) return existingBalance;

            if (existingBalance.Payload < Amount)
            {
                return new JsonPayload<double>(0, $"Cannot remove {Amount} from {existingBalance.Payload}. Card balance would be less than zero.")
                { StatusCode = ResponseStatusCode.INVALID_ARGUMENTS };
            }

            var transaction = new GiftCardTransaction(scan, GcTransactionType.RedeemPoints)
            {
                AmountT1 = Amount
            };

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        [HttpPost]
        public async Task<JsonPayload<double>> RemoveValue([FromForm] string scan, [FromForm] int? Amount)
        {
            var existingBalance = await this.BalanceMoney(scan);
            if (!existingBalance.IsSuccess) return existingBalance;

            if (existingBalance.Payload < Amount)
            {
                return new JsonPayload<double>(0, $"Cannot remove {Amount} from {existingBalance.Payload}. Card balance would be less than zero.")
                { StatusCode = ResponseStatusCode.INVALID_ARGUMENTS };
            }


            var transaction = new GiftCardTransaction(scan, GcTransactionType.Redeem)
            {
                AmountT1 = Amount
            };

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        [HttpPost]
        public async Task<JsonPayload<double>> BalanceMoney([FromForm] string scan)
        {
            var transaction = new GiftCardTransaction(scan, GcTransactionType.BalanceInquiry);

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }

        [HttpPost]
        public async Task<JsonPayload<bool>> SetInfo([FromBody] GiftCardDTO info)
        {
            var entities = new List<GiftCardInfo>();

            await Task.WhenAll(
                this.SetPoints(info.CardSwipe ?? info.PrimaryAccountNumber, (int)info.Points),
                this.SetValue(info.CardSwipe ?? info.PrimaryAccountNumber, (int)info.Balance)
            );

            using (var conn = this.GetConnection())
            {
                if (info.ID > 0)
                {
                    int numUpdated = await conn.ExecuteAsync("UPDATE giftcards SET `points` = @points, `balance` = @balance WHERE `id` = @id", new
                    {
                        id = info.ID,
                        points = info.Points,
                        balance = info.Balance
                    });

                }
                else
                {
                    object pam = null;
                    object cardSwipe = null;
                    string scan = info.CardSwipe ?? info.PrimaryAccountNumber;
                    GiftCardScanType scanType = GiftCardHelper.GetScanType(scan);
                    if (scanType == GiftCardScanType.MagneticCardSwipeFormatB)
                    {
                        cardSwipe = scan;
                        pam = GiftCardHelper.GetPrimaryAccountNumberFromSwipe(scan);
                    }
                    else if (scanType == GiftCardScanType.PrimaryAccountNumber)
                    {
                        pam = scan;
                    }


                    //SELECT  `id`,  `phone`, LEFT(`cardSwipe`, 256),  `primaryAccountNumber`,  `lastUsed`,  `points`,  `balance`,  `isActive` FROM `portal.mtcoffee.net`.`giftcards` LIMIT 1000;
                    var executed = await conn.QueryAsync<int>("INSERT INTO `giftcards` " +
                        "(`phone`, `cardSwipe`, `primaryAccountNumber`, `points`,  `balance`) " +
                        "VALUES (@phone, @cardSwipe, @pam, @points, @balance);" +
                        " SELECT LAST_INSERT_ID();",
                        new
                        {
                            points = info.Points,
                            balance = info.Balance,
                            phone = null as string,
                            pam = pam as string,
                            cardSwipe = cardSwipe as string
                        });

                    int idInserted = executed.SingleOrDefault();
                }
            }

            return new JsonPayload<bool>(true);
        }

        [HttpPost]
        public async Task<JsonPayload<GiftCardDTO>> GetInfo([FromForm] string scan)
        {
            var (points, money) = await TaskEx.WhenAll(
                this.BalancePoints(scan),
                this.BalanceMoney(scan)
            );

            var entities = new List<GiftCardInfo>();
            var scanType = GiftCardHelper.GetScanType(scan);
            if (scanType == GiftCardScanType.Phone)
                throw new ArgumentException("You may look up a list of gift cards by phone number," +
                         " but you must use a different API call for that.");

            string q = "SELECT * FROM giftcards " +
                "WHERE isActive = 1 AND (@needle = `cardSwipe` OR  @needle = `primaryAccountNumber`) " +
                "LIMIT 1";

            using (var conn = this.GetConnection())
            {
                var existingGc = (await conn.QueryAsync<GiftCardDTO>(q, new { needle = scan })).FirstOrDefault();
                if (existingGc != null)
                {
                    int numUpdated = await conn.ExecuteAsync("UPDATE giftcards SET `points` = @points, `balance` = @balance WHERE `id` = @id", new
                    {
                        id = existingGc.ID,
                        points = points.IsSuccess ? points.Payload : -1,
                        balance = money.IsSuccess ? money.Payload : -1
                    });

                    return new JsonPayload<GiftCardDTO>(new GiftCardDTO()
                    {
                        ID = existingGc.ID,
                        Balance = money.IsSuccess ? money.Payload : -1.0,
                        Points = points.IsSuccess ? points.Payload : -1.0,
                        Phone = existingGc.Phone,
                        CardSwipe = existingGc.CardSwipe,
                        PrimaryAccountNumber = existingGc.PrimaryAccountNumber
                    });
                }
                else
                {
                    object pam = null;
                    object cardSwipe = null;
                    if (scanType == GiftCardScanType.MagneticCardSwipeFormatB)
                    {
                        cardSwipe = scan;
                        pam = GiftCardHelper.GetPrimaryAccountNumberFromSwipe(scan);
                    }
                    else if (scanType == GiftCardScanType.PrimaryAccountNumber)
                    {
                        pam = scan;
                    }


                    //SELECT  `id`,  `phone`, LEFT(`cardSwipe`, 256),  `primaryAccountNumber`,  `lastUsed`,  `points`,  `balance`,  `isActive` FROM `portal.mtcoffee.net`.`giftcards` LIMIT 1000;
                    var executed = await conn.QueryAsync<int>("INSERT INTO `giftcards` " +
                        "(`phone`, `cardSwipe`, `primaryAccountNumber`, `points`,  `balance`) " +
                        "VALUES (@phone, @cardSwipe, @pam, @points, @balance);" +
                        " SELECT LAST_INSERT_ID();",
                        new
                        {
                            points = points.IsSuccess ? points.Payload : -1,
                            balance = money.IsSuccess ? money.Payload : -1,
                            phone = null as string,
                            pam = pam as string,
                            cardSwipe = cardSwipe as string
                        });

                    int idInserted = executed.SingleOrDefault();

                    return new JsonPayload<GiftCardDTO>(new GiftCardDTO()
                    {
                        ID = idInserted,
                        Balance = money.IsSuccess ? money.Payload : -1.0,
                        Points = points.IsSuccess ? points.Payload : -1.0,
                        Phone = null,
                        CardSwipe = cardSwipe as string,
                        PrimaryAccountNumber = pam as string
                    });
                }
            }
        }

        [HttpPost]
        public async Task<JsonPayload<double>> BalancePoints([FromForm] string scan)
        {
            var transaction = new GiftCardTransaction(scan, GcTransactionType.PointsBalanceInquiry);

            var payload = transaction.ToString();

            using (var client = new WebClient())
            {
                string response = await client.UploadStringTaskAsync(url, payload);

                var resp = GiftCardTransactionResponse.FromString(response);
                if (resp.IsSuccess) return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0));
                else return new JsonPayload<double>(resp.CardBalanceAfterTransaction.GetValueOrDefault(0), resp.Text);
            }
        }
    }
}