using Microsoft.AspNetCore.Mvc;

namespace WellTaxes.Service.Gateaway.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class OrderController : ControllerBase
    {

        [HttpGet]
        public IActionResult Get()
        {
            return Ok();
        }
    }
}
