using WellTaxes.Service.Orders.Data.Entities;

namespace WellTaxes.Service.Gateaway.Services
{
    public class OrderServiceClient : IOrderServiceClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<OrderServiceClient> _logger;

        public OrderServiceClient(IHttpClientFactory httpClientFactory, ILogger<OrderServiceClient> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var client = _httpClientFactory.CreateClient("OrdersService");
            try
            {
                var response = await client.GetAsync("Orders/Get");
                response.EnsureSuccessStatusCode();
                var orders = await response.Content.ReadFromJsonAsync<IEnumerable<OrderDto>>();
                return orders ?? Enumerable.Empty<OrderDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all orders from Orders service");
                throw;
            }
        }

        public async Task<OrderDto?> GetOrderByIdAsync(Guid id)
        {
            var client = _httpClientFactory.CreateClient("OrdersService");
            try
            {
                var response = await client.GetAsync($"Orders/GetById/{id}");
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return null;
                }
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order {OrderId} from Orders service", id);
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(Guid userId)
        {
            var client = _httpClientFactory.CreateClient("OrdersService");
            try
            {
                var response = await client.GetAsync($"Orders/GetByUserId/{userId}");
                response.EnsureSuccessStatusCode();
                var orders = await response.Content.ReadFromJsonAsync<IEnumerable<OrderDto>>();
                return orders ?? Enumerable.Empty<OrderDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders for user {UserId} from Orders service", userId);
                throw;
            }
        }

        public async Task<OrderDto?> CreateOrderAsync(CreateOrderDto createOrderDto)
        {
            var client = _httpClientFactory.CreateClient("OrdersService");
            try
            {
                var response = await client.PostAsJsonAsync("Orders/Create", createOrderDto);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order in Orders service");
                throw;
            }
        }

        public async Task<OrderDto?> UpdateOrderStatusAsync(Guid id, OrderStatus status)
        {
            var client = _httpClientFactory.CreateClient("OrdersService");
            try
            {
                var response = await client.PutAsJsonAsync($"Orders/UpdateStatus/{id}", new { Status = status });
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return null;
                }
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order {OrderId} status in Orders service", id);
                throw;
            }
        }
    }
}
