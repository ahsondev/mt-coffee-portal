using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MtCoffee.Web.Models
{
    public class RequestPayload<T>
    {
        public T Payload { get; set; }
    }
}
