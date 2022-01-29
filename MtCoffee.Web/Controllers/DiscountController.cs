using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtCoffee.Web.Models;
using MtCoffee.Web.Models.Product;

namespace MtCoffee.Web.Controllers
{
    [Authorize]
    public class DiscountController : BaseCrudApiController<Discount>
    {
        public DiscountController() : base("discounts", m => m.Id)
        {
        }


        [HttpDelete]
        public override async Task<JsonPayload<int>> Delete([FromQuery] int id)
        {
            var rt = await base.Delete(id);
            using (var conn = this.GetConnection())
            {
                var rs = await conn.ExecuteAsync(@"DELETE FROM `product_discounts` WHERE discountId = @Id",
                    new { Id = id });
            }

            return rt;
        }
        
        [HttpPost]
        public async Task<JsonPayload<bool?>> LinkToProducts(int discountId, List<int> productIds)
        {
            using (var conn = this.GetConnection())
            {
                var linksDto = await conn.QueryAsync<ProductDiscountDTO>("SELECT * FROM product_discounts WHERE " +
                    "discountId = @discountId AND productId IN @productIds",
                    new
                    {
                        discountId = discountId,
                        productIds = productIds
                    });

                var alreadyInDb = linksDto.ToList();
                var toAddArray = productIds.Where(prodId => !alreadyInDb.Any(existing => existing.ProductId == prodId)).Select(toAdd => new
                {
                    productId = toAdd,
                    discountId = discountId
                }).ToArray();

                await conn.ExecuteAsync($"INSERT INTO product_discounts (productId, discountId) VALUES (@productId, @discountId)", toAddArray);
            }

            return new JsonPayload<bool?>(true);
        }

        [HttpDelete]
        public async Task<JsonPayload<bool?>> UnlinkFromProducts(int discountId, List<int> productIds)
        {
            using (var conn = this.GetConnection())
            {
                await conn.ExecuteAsync("DELETE FROM product_discounts WHERE discountId = @discountId AND productId IN @productIds",
                new
                {
                    discountId = discountId,
                    productIds = productIds
                });
            }

            return new JsonPayload<bool?>(true);
        }
    }
}