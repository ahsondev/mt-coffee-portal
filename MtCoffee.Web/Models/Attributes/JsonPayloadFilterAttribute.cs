using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using MtCoffee.Web.Models;

namespace MtCoffee.Web.Attributes
{
    public class JsonPayloadFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            if (actionContext.ActionDescriptor is ControllerActionDescriptor)
            {
                var controllerDesc = (ControllerActionDescriptor) actionContext.ActionDescriptor;
                var methodInfo = controllerDesc.MethodInfo;
                string typName = methodInfo.ReturnType.FullName;
                if (typName.Contains("JsonPayload"))
                {
                    actionContext.HttpContext.Items["x-JsonPayload"] = true;
                }
            }

            base.OnActionExecuting(actionContext);
        }
    }
}
