using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.Product
{

    public class ProductProductOptionDTO
    {
        public int ProductId { get; set; }
        public int ProductOptionId { get; set; }
    }

    public class ProductOption
    {
        public int? Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        public double? Price { get; set; }

        /// <summary>
        ///  Use this to group by something. Like... "DRINK_OPTIONS"
        /// </summary>
        public string OptionGroupKey { get; set; }
        public bool IsQuantityEnabled { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
