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
    public class ProductCategoryController : BaseCrudApiController<ProductCategory>
    {
        public ProductCategoryController() : base("product_categories", m => m.Id)
        {
        }
    }
}