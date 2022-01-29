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
    public class ProductVariantController : BaseCrudApiController<ProductVariant>
    {
        public ProductVariantController() : base("product_variants", m => m.Id)
        {
        }
    }
}