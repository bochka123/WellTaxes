using WellTaxes.Service.Core.Entities;

namespace WellTaxes.Service.Orders.Services
{
    public class OrderService : IOrderService
    {
        public Task<Order> CreateOrderAsync(Guid userId, decimal amount, decimal amountWithTax, decimal latitude, decimal longitude)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Order?> GetOrderByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> OrderExistsAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }
    }
}
