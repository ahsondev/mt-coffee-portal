using System;
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
    public class ProductOptionController : BaseCrudApiController<ProductOption>
    {
        public ProductOptionController() : base("product_options", m => m.Id)
        {
        }

        [HttpDelete]
        public override async Task<JsonPayload<int>> Delete(int id)
        {
            var rt = await base.Delete(id);
            using (var conn = this.GetConnection())
            {
                var rs = await conn.ExecuteAsync($"DELETE FROM product_product_options WHERE productOptionId = @Id", new { Id = id });
            }

            return rt;
        }

        [HttpPost]
        public async Task<JsonPayload<bool?>> LinkToProducts([FromForm] int productOptionId, [FromForm] List<int> productIds)
        {
            using (var conn = this.GetConnection())
            {
                var linksDto = await conn.QueryAsync<ProductProductOptionDTO>("SELECT * FROM product_product_options WHERE " +
                    "productOptionId = @productOptionId AND productId IN @productIds",
                    new
                    {
                        productOptionId = productOptionId,
                        productIds = productIds
                    });

                var alreadyInDb = linksDto.ToList();
                var toAddArray = productIds.Where(prodId => !alreadyInDb.Any(existing => existing.ProductId == prodId)).Select(toAdd => new
                {
                    productId = toAdd,
                    productOptionId = productOptionId
                }).ToArray();

                await conn.ExecuteAsync($"INSERT INTO product_product_options (productId, productOptionId) VALUES (@productId, @productOptionId)", toAddArray);
            }

            return new JsonPayload<bool?>(true);
        }

        [HttpDelete]
        public async Task<JsonPayload<bool?>> UnlinkFromProducts([FromForm] int productOptionId, [FromForm] List<int> productIds)
        {
            using (var conn = this.GetConnection())
            {
                await conn.ExecuteAsync("DELETE FROM product_product_options WHERE productOptionId = @productOptionId AND productId IN @productIds",
                new
                {
                    productOptionId = productOptionId,
                    productIds = productIds
                });
            }

            return new JsonPayload<bool?>(true);
        }
    }
}