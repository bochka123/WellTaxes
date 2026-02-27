using Dapper;
using Microsoft.AspNetCore.Http;
using Npgsql;
using WellTaxes.Service.Core.Entities;

namespace WellTaxes.Service.Core.Services
{
    public class OrderService(NpgsqlConnection db, IHttpContextAccessor httpContextAccessor) : IOrderService
    {
        private Guid GetCurrentUserId()
        {
            var user = httpContextAccessor.HttpContext?.User;
            var userIdString = user?.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
                            ?? user?.FindFirst("oid")?.Value;

            return Guid.TryParse(userIdString, out var userId) ? userId : throw new UnauthorizedAccessException();
        }

        public async Task<Order> CreateOrderAsync(decimal amount, decimal latitude, decimal longitude)
        {
            var userId = GetCurrentUserId();

            var taxLookupSql = @"
                SELECT tr.id as TaxRatesId, tr.total_rate as TotalRate
                FROM tax_rates tr
                JOIN jurisdictions j ON tr.jurisdiction_id = j.id
                WHERE ST_Contains(j.geom, ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4269))
                ORDER BY tr.created_at DESC
                LIMIT 1";

            var taxInfo = await db.QueryFirstOrDefaultAsync<dynamic>(taxLookupSql, new { Longitude = longitude, Latitude = latitude });

            if (taxInfo == null)
            {
                throw new InvalidOperationException("Delivery for this coordinates is imposible. No jurisdiction is found.");
            }

            var totalRate = (decimal)taxInfo.totalrate;
            var amountWithTax = amount * (1 + totalRate);
            var orderNumber = $"ORD-{DateTime.UtcNow:yyMMddHHmmss}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
            var taxRatesId = (Guid)taxInfo.taxratesid;

            var insertSql = @"
                INSERT INTO orders (order_number, user_id, amount, amount_with_tax, latitude, longitude, tax_rates_id, created_at, updated_at)
                VALUES (@OrderNumber, @UserId, @Amount, @AmountWithTax, @Latitude, @Longitude, @TaxRatesId, NOW(), NOW())
                RETURNING id as Id, order_number as OrderNumber, user_id as UserId, amount as Amount, 
                          amount_with_tax as AmountWithTax, latitude as Latitude, longitude as Longitude, 
                          tax_rates_id as TaxRatesId, created_at as CreatedAt, updated_at as UpdatedAt";

            return await db.QuerySingleAsync<Order>(insertSql, new
            {
                OrderNumber = orderNumber,
                UserId = userId,
                Amount = amount,
                AmountWithTax = amountWithTax,
                Latitude = latitude,
                Longitude = longitude,
                TaxRatesId = taxRatesId
            });
        }

        public async Task<Order?> GetOrderByIdAsync(Guid id)
        {
            var userId = GetCurrentUserId();
            var sql = @"
                SELECT id as Id, order_number as OrderNumber, user_id as UserId, amount as Amount, 
                       amount_with_tax as AmountWithTax, latitude as Latitude, longitude as Longitude, 
                       tax_rates_id as TaxRatesId, created_at as CreatedAt, updated_at as UpdatedAt
                FROM orders WHERE id = @Id AND user_id = @UserId";

            return await db.QueryFirstOrDefaultAsync<Order>(sql, new { Id = id, UserId = userId });
        }

        public async Task<bool> UpdateOrderAsync(Guid id, decimal amount, decimal latitude, decimal longitude)
        {
            var userId = GetCurrentUserId();

            var existingOrder = await GetOrderByIdAsync(id);
            if (existingOrder == null) return false;

            var taxLookupSql = @"
                SELECT tr.id as TaxRatesId, tr.total_rate as TotalRate
                FROM tax_rates tr
                JOIN jurisdictions j ON tr.jurisdiction_id = j.id
                WHERE ST_Contains(j.geom, ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4269))
                ORDER BY tr.created_at DESC LIMIT 1";

            var taxInfo = await db.QueryFirstOrDefaultAsync<dynamic>(taxLookupSql, new { Longitude = longitude, Latitude = latitude });
            if (taxInfo == null) throw new InvalidOperationException("New coordinates are out of service range.");

            var amountWithTax = amount * (1 + (decimal)taxInfo.totalrate);
            var taxRatesId = (Guid)taxInfo.taxratesid;

            var updateSql = @"
                UPDATE orders 
                SET amount = @Amount, amount_with_tax = @AmountWithTax, latitude = @Latitude, 
                    longitude = @Longitude, tax_rates_id = @TaxRatesId, updated_at = NOW()
                WHERE id = @Id AND user_id = @UserId";

            var affected = await db.ExecuteAsync(updateSql, new
            {
                Amount = amount,
                AmountWithTax = amountWithTax,
                Latitude = latitude,
                Longitude = longitude,
                TaxRatesId = taxRatesId,
                Id = id,
                UserId = userId
            });

            return affected > 0;
        }

        public async Task<bool> DeleteOrderAsync(Guid id)
        {
            var userId = GetCurrentUserId();
            var sql = "DELETE FROM orders WHERE id = @Id AND user_id = @UserId";
            var affected = await db.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return affected > 0;
        }
    }
}
