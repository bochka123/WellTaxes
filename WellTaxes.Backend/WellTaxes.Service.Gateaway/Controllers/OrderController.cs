using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Gateaway.Services;
using WellTaxes.Service.Orders.Data.Entities;

namespace WellTaxes.Service.Gateaway.Controllers
{
    /// <summary>
    /// Gateway controller for managing orders
    /// </summary>
    [ApiController]
    [Route("[controller]/[action]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderServiceClient _orderServiceClient;
        private readonly IUserService _userService;

        public OrderController(IOrderServiceClient orderServiceClient, IUserService userService)
        {
            _orderServiceClient = orderServiceClient;
            _userService = userService;
        }

        /// <summary>
        /// Gets all orders from the Orders service
        /// </summary>
        /// <returns>List of all orders</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            var orders = await _orderServiceClient.GetAllOrdersAsync();
            return Ok(orders);
        }

        /// <summary>
        /// Gets an order by ID from the Orders service
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <returns>Order details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _orderServiceClient.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        /// <summary>
        /// Gets all orders for a specific user from the Orders service
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>List of user's orders</returns>
        [HttpGet("{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var userExists = await _userService.UserExistsAsync(userId);
            if (!userExists)
            {
                return NotFound("User not found");
            }

            var orders = await _orderServiceClient.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        /// <summary>
        /// Creates a new order in the Orders service
        /// </summary>
        /// <param name="request">Order creation request</param>
        /// <returns>Created order</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
        {
            var userExists = await _userService.UserExistsAsync(request.UserId);
            if (!userExists)
            {
                return BadRequest("User not found");
            }

            var createOrderDto = new CreateOrderDto(
                request.UserId,
                request.Amount,
                request.AmountWithTax,
                request.Latitude,
                request.Longitude);

            var order = await _orderServiceClient.CreateOrderAsync(createOrderDto);
            return CreatedAtAction(nameof(GetById), new { id = order!.Id }, order);
        }

        /// <summary>
        /// Updates the status of an order in the Orders service
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <param name="request">Status update request</param>
        /// <returns>Updated order</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _orderServiceClient.UpdateOrderStatusAsync(id, request.Status);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }
    }

    /// <summary>
    /// Request model for creating an order via gateway
    /// </summary>
    public record CreateOrderRequest(Guid UserId, decimal Amount, decimal AmountWithTax, decimal Latitude, decimal Longitude);

    /// <summary>
    /// Request model for updating order status via gateway
    /// </summary>
    public record UpdateOrderStatusRequest(OrderStatus Status);
}
