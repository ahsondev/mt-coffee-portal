using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.Product
{

    public class ProductDiscountDTO
    {
        public int ProductId { get; set; }
        public int DiscountId { get; set; }
    }

    public class Discount
    {
        public int? Id { get; set; }
        
        /// <summary>
        /// Leave null if an OPEN amount.
        /// 20% = 0.20
        /// 25$ = 25.00
        /// </summary>
        public double? Amount { get; set; }

        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// If true, a custom percent can be entered.
        /// </summary>
        public bool IsOpen { get; set; } = false;
        public bool IsManagerRequired { get; set; } = false;
        public bool IsAppliedToTransactions { get; set; } = false;
        public bool IsAppliedToItems { get; set; } = false;

        /// <summary>
        /// A custom equation for determining the sale price.
        /// </summary>
        public string CustomEquation { get; set; }

        /// <summary>
        /// Ordering of how it should show up in lists. 100, 200, 210, etc.
        /// </summary>
        public int? SortOrder { get; set; }

        /// <summary>
        /// AMOUNT or PERCENT
        /// </summary>
        public string Type { get; set; } = "PERCENT";
    }
}
