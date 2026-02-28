using WellTaxes.Service.Core.Entities;

namespace WellTaxes.Service.Core.Interfaces
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(decimal amount, decimal latitude, decimal longitude, DateTime orderTimestamp);
        Task<Order?> GetOrderByIdAsync(Guid id);
        Task<bool> UpdateOrderAsync(Guid id, decimal amount, decimal latitude, decimal longitude);
        Task<bool> DeleteOrderAsync(Guid id);
    }
}
