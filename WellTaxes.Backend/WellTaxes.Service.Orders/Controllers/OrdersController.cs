using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Core.Queries;
using WellTaxes.Service.Core.Services;

namespace WellTaxes.Service.Orders.Controllers
{
    /// <summary>
    /// Controller for managing orders
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class OrdersController(IMediator mediator, IOrderService orderService) : ControllerBase
    {

        /// <summary>
        /// Gets all orders
        /// </summary>
        /// <returns>List of all orders</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get([FromQuery] GetOrdersQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Gets an order by ID
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <returns>Order details</returns>
        [HttpGet("[action]/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await orderService.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        /// <summary>
        /// Creates a new order
        /// </summary>
        /// <param name="request">Order creation request</param>
        /// <returns>Created order</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
        {
            var order = await orderService.CreateOrderAsync(
                request.UserId,
                request.Amount,
                request.AmountWithTax,
                request.Latitude,
                request.Longitude);

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [HttpPost("[action]")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Import([FromBody] object request)
        {
            return Ok();
        }
    }

    /// <summary>
    /// Request model for creating an order
    /// </summary>
    public record CreateOrderRequest(Guid UserId, decimal Amount, decimal AmountWithTax, decimal Latitude, decimal Longitude);
}
