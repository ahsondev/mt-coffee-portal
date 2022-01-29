using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.Product
{
    public class Product
    {
        public int? Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public double Price { get; set; }

        public int? CategoryId { get; set; }

        public virtual bool HasVariants { get => Variants.Any(); }

        public virtual ICollection<int> DiscountIds { get; set; }
        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<int> ProductOptionIds { get; internal set; }
    }

    public class ProductVariant
    {
        public int? Id { get; set; }
        [Required]
        public string Name { get; set; }
        public int ProductId { get; set; }
        public double? PriceOverride { get; set; } = null;
        public bool IsDefaultVariant { get; set; } = false;
    }
}
