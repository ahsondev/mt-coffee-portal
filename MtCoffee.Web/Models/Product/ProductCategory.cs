using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.Product
{

    public class ProductCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }

        /// <summary>
        /// HTML color code for the button tiles.
        /// </summary>
        public string TileColor { get; set; }

        /// <summary>
        /// The priority ordering (if any) of when the category items should be displayed.
        /// </summary>
        public int SortOrder { get; set; } = 0;

        public string CategoryGroupName { get; set; }
    }
}
