using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Core.Queries;

namespace WellTaxes.Service.Orders.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    [Authorize]
    public class JurisdictionController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            var result = await mediator.Send(new GetJurisdictionsQuery());
            return Ok(result);
        }
    }
}
