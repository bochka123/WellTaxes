using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WellTaxes.Service.Core.Entities;
using WellTaxes.Service.Core.Interfaces;
using WellTaxes.Service.Core.Queries;

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
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await orderService.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            
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
            var order = await orderService.CreateOrderAsync(request.Amount, request.Latitude, request.Longitude, request.Timestamp);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        /// <summary>
        /// Updates an order
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <param name="request">Order update request</param>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrderRequest request)
        {
            var success = await orderService.UpdateOrderAsync(id, request.Amount, request.Latitude, request.Longitude);
            if (!success) return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Deletes an order
        /// </summary>
        /// <param name="id">Order ID</param>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await orderService.DeleteOrderAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Imports orders from CSV file
        /// CSV format: id, longitude, latitude, timestamp, subtotal
        /// </summary>
        /// <param name="file">CSV file to import</param>
        /// <param name="importService">Order import service</param>
        /// <returns>Import result with success/failure counts</returns>
        [HttpPost("[action]")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Import(IFormFile file, [FromServices] IOrderImportService importService)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File is required");
            }

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only CSV files are supported");
            }

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await importService.ImportOrdersFromCsvAsync(stream, HttpContext.RequestAborted);

                if (result.FailedCount > 0)
                {
                    return Ok(new
                    {
                        Message = "Import completed with errors",
                        Result = result
                    });
                }

                return Ok(new
                {
                    Message = "Import completed successfully",
                    Result = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    /// <summary>
    /// Request model for creating an order
    /// </summary>
    public record CreateOrderRequest(decimal Amount, decimal Latitude, decimal Longitude, DateTime Timestamp);
    public record UpdateOrderRequest(decimal Amount, decimal Latitude, decimal Longitude);
}
