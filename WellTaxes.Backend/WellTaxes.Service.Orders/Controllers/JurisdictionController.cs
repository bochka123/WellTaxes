using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using WellTaxes.Service.Core.Quries;

namespace WellTaxes.Service.Orders.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    [Authorize]
    public class JurisdictionController(NpgsqlConnection db): ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            var jurisdictions = await db.GetJurisdictionsAsync();
            return Ok(jurisdictions);
        }
    }
}
