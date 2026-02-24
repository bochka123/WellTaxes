using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Gateaway.Services;
using WellTaxes.Service.Orders.Data.Entities;

namespace WellTaxes.Service.Gateaway.Controllers
{
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

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var orders = await _orderServiceClient.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _orderServiceClient.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        [HttpGet("{userId}")]
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

        [HttpPost]
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

        [HttpPut("{id}")]
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

    public record CreateOrderRequest(Guid UserId, decimal Amount, decimal AmountWithTax, decimal Latitude, decimal Longitude);
    public record UpdateOrderStatusRequest(OrderStatus Status);
}
