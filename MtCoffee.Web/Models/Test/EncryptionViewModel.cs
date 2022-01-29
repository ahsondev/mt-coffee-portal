using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models.Test
{
    public class EncryptionViewModel
    {
        [Required]
        public string Content { get; set; }

        public string EncryptedContent { get; set; }
    }
}
