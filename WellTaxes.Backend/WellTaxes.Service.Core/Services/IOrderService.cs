using WellTaxes.Service.Core.Entities;

namespace WellTaxes.Service.Core.Services
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task<Order?> GetOrderByIdAsync(Guid id);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId);
        Task<Order> CreateOrderAsync(Guid userId, decimal amount, decimal amountWithTax, decimal latitude, decimal longitude);
        Task<bool> OrderExistsAsync(Guid id);
    }
}
