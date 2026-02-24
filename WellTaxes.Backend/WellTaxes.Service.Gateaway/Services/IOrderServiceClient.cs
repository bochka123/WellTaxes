using WellTaxes.Service.Orders.Data.Entities;

namespace WellTaxes.Service.Gateaway.Services
{
    public interface IOrderServiceClient
    {
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
        Task<OrderDto?> GetOrderByIdAsync(Guid id);
        Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(Guid userId);
        Task<OrderDto?> CreateOrderAsync(CreateOrderDto createOrderDto);
        Task<OrderDto?> UpdateOrderStatusAsync(Guid id, OrderStatus status);
    }

    public record OrderDto(
        Guid Id,
        string OrderNumber,
        Guid UserId,
        decimal Amount,
        decimal AmountWithTax,
        OrderStatus Status,
        decimal Latitude,
        decimal Longitude,
        DateTime CreatedAt,
        DateTime UpdatedAt);

    public record CreateOrderDto(
        Guid UserId,
        decimal Amount,
        decimal AmountWithTax,
        decimal Latitude,
        decimal Longitude);
}
