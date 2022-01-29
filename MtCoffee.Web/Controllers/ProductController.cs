using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using MtCoffee.Web.Models;
using MtCoffee.Web.Models.Product;
using MtCoffee.Common.Extensions;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using MtCoffee.Common.Utilities;
using Microsoft.AspNetCore.Authorization;

namespace MtCoffee.Web.Controllers
{
    [Authorize]
    public class ProductController : BaseCrudApiController<Product>
    {
        public ProductController() : base("products", m => m.Id)
        {
        }

        [HttpGet]
        public override async Task<JsonPayload<List<Product>>> List()
        {
            using (var conn = this.GetConnection())
            {
                var productRs = await conn.QueryAsync<Product>(@"SELECT * FROM products");
                var products = productRs.ToList();
                var productIds = products.Select(p => p.Id).ToArray();

                var extendedRs = await conn.QueryMultipleAsync("SELECT * FROM product_discounts WHERE productId IN @ProductIds;" +
                    "SELECT * from product_variants WHERE productId in @ProductIds;" +
                    "SELECT * FROM product_product_options WHERE productId in @ProductIds;"
                    , new { ProductIds = productIds });
                var discountIds = await extendedRs.ReadAsync<ProductDiscountDTO>(true);
                var productVariants = await extendedRs.ReadAsync<ProductVariant>(true);
                var productOptionIds = await extendedRs.ReadAsync<ProductProductOptionDTO>(true);

                products.ForEach(p =>
                {
                    p.DiscountIds = discountIds.Where(d => d.ProductId == p.Id.Value).Select(d => d.DiscountId).ToList();
                    p.Variants = productVariants.Where(d => d.ProductId == p.Id.Value).ToList();
                    p.ProductOptionIds = productOptionIds.Where(d => d.ProductId == p.Id.Value).Select(d => d.ProductOptionId).ToList();
                });

                return new JsonPayload<List<Product>>(products);
            }
        }


        [HttpDelete]
        public override async Task<JsonPayload<int>> Delete(int id)
        {
            var rt = await base.Delete(id);
            using (var conn = this.GetConnection())
            {
                var rs = await conn.ExecuteAsync($"DELETE FROM product_product_options WHERE productId = @Id;" +
                    $"DELETE FROM product_variants WHERE productId = @Id;" +
                    $"DELETE FROM product_discounts WHERE productId = @Id", new { Id = id });
            }

            return rt;
        }


        [HttpPost]
        public async Task<JsonPayload<bool?>> LinkToProductOptions([FromForm] int productId, [FromForm] List<int> productOptionIds)
        {
            using (var conn = this.GetConnection())
            {
                var linksDto = await conn.QueryAsync<ProductProductOptionDTO>("SELECT * FROM product_product_options WHERE " +
                    "productId = @productId AND productOptionId IN @productOptionIds",
                    new
                    {
                        productId = productId,
                        productOptionIds = productOptionIds
                    });

                var alreadyInDb = linksDto.ToList();
                var toAddArray = productOptionIds.Where(optId => !alreadyInDb.Any(existing => existing.ProductOptionId == optId)).Select(toAdd => new
                {
                    productId = productId,
                    productOptionId = toAdd
                }).ToArray();

                await conn.ExecuteAsync($"INSERT INTO product_product_options (productId, productOptionId) VALUES (@productId, @productOptionId)", toAddArray);
            }

            return new JsonPayload<bool?>(true);
        }

        [HttpDelete]
        public async Task<JsonPayload<bool?>> UnlinkFromProductOptions([FromForm] int productId, [FromForm] List<int> productOptionIds)
        {
            using (var conn = this.GetConnection())
            {
                var linksDto = await conn.QueryAsync<ProductProductOptionDTO>(
                    "DELETE FROM product_product_options WHERE productId = @productId AND productOptionId IN @productOptionIds",
                    new
                    {
                        productId = productId,
                        productOptionIds = productOptionIds
                    });
            }

            return new JsonPayload<bool?>(true);
        }
    }
}