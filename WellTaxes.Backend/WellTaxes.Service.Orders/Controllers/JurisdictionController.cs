using MediatR;
using MessagePack;
using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Core.Queries;

namespace WellTaxes.Service.Orders.Controllers
{
    /// <summary>
    /// Controller for managing jurisdictions
    /// </summary>
    [ApiController]
    [Route("[controller]/[action]")]
    //[Authorize]
    public class JurisdictionController(IMediator mediator) : ControllerBase
    {
        /// <summary>
        /// Streams jurisdictions data in binary MessagePack format using HTTP/2
        /// </summary>
        /// <returns>Binary stream of jurisdictions data</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task Get()
        {
            Response.ContentType = "text/plain";

            var jurisdictions = await mediator.Send(new GetJurisdictionsQuery());

            await foreach (var jurisdiction in jurisdictions)
            {
                var bytes = MessagePackSerializer.Serialize(jurisdiction);
                await Response.Body.WriteAsync(bytes, 0, bytes.Length);
                await Response.Body.FlushAsync();
            }
        }
    }
}
