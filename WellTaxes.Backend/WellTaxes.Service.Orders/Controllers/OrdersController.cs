using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Orders.Data.Entities;
using WellTaxes.Service.Orders.Services;

namespace WellTaxes.Service.Orders.Controllers
{
    /// <summary>
    /// Controller for managing orders
    /// </summary>
    [ApiController]
    [Route("[controller]/[action]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        /// <summary>
        /// Gets all orders
        /// </summary>
        /// <returns>List of all orders</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        /// <summary>
        /// Gets an order by ID
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <returns>Order details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        /// <summary>
        /// Gets all orders for a specific user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>List of user's orders</returns>
        [HttpGet("{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
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
            var order = await _orderService.CreateOrderAsync(
                request.UserId,
                request.Amount,
                request.AmountWithTax,
                request.Latitude,
                request.Longitude);

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        /// <summary>
        /// Updates the status of an order
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <param name="request">Status update request</param>
        /// <returns>Updated order</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, request.Status);
            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }
    }

    /// <summary>
    /// Request model for creating an order
    /// </summary>
    public record CreateOrderRequest(Guid UserId, decimal Amount, decimal AmountWithTax, decimal Latitude, decimal Longitude);

    /// <summary>
    /// Request model for updating order status
    /// </summary>
    public record UpdateOrderStatusRequest(OrderStatus Status);
}
