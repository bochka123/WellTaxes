using WellTaxes.Service.Orders.Data.Entities;

namespace WellTaxes.Service.Orders.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order?> GetOrderByIdAsync(Guid id);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId);
        Task<Order> CreateOrderAsync(Guid userId, decimal amount, decimal amountWithTax, decimal latitude, decimal longitude);
        Task<Order?> UpdateOrderStatusAsync(Guid id, OrderStatus status);
        Task<bool> OrderExistsAsync(Guid id);
    }
}
