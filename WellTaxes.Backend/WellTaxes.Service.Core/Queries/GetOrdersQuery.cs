using Dapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Npgsql;
using System.Globalization;
using System.Text;

namespace WellTaxes.Service.Core.Queries
{
    public record OrderListDto(
        Guid Id,
        string OrderNumber,
        decimal Amount,
        decimal AmountWithTax,
        decimal TotalRate,
        string TaxRegionName,
        DateTime CreatedAt
    );

    public class FilterCriterion
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class GetOrdersQuery : IRequest<PagedResult<OrderListDto>>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "CreatedAt";
        public bool SortDescending { get; set; } = true;
        public List<FilterCriterion> Filters { get; set; } = new();
    }

    public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);

    public class GetOrdersHandler(NpgsqlConnection db, IHttpContextAccessor httpContextAccessor) : IRequestHandler<GetOrdersQuery, PagedResult<OrderListDto>>
    {
        public async Task<PagedResult<OrderListDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        {
            var user = httpContextAccessor.HttpContext?.User;
            var userIdString = user?.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
                ?? user?.FindFirst("oid")?.Value;

            if (!Guid.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("Користувач не авторизований або в токені відсутній Object ID.");
            }

            var parameters = new DynamicParameters();

            var sqlBuilder = new StringBuilder(@"
                FROM orders o
                JOIN tax_rates tr ON o.tax_rates_id = tr.id
                WHERE o.user_id = @UserId ");

            parameters.Add("UserId", userId);

            var columnMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "OrderNumber", "o.order_number" },
                { "Amount", "o.amount" },
                { "CreatedAt", "o.created_at" },
                { "TotalRate", "tr.total_rate" },
                { "Region", "tr.tax_region_name" }
            };

            if (request.Filters != null)
            {
                foreach (var filter in request.Filters)
                {
                    if (columnMap.TryGetValue(filter.Field, out var dbField))
                    {
                        var paramName = $"@p{parameters.ParameterNames.Count()}";
                        var op = filter.Operator.ToLower() switch
                        {
                            "eq" => "=",
                            "gt" => ">",
                            "lt" => "<",
                            "like" => "ILIKE",
                            _ => "="
                        };

                        object paramValue;

                        if (filter.Operator.ToLower() == "like")
                        {
                            paramValue = $"%{filter.Value}%";
                        }
                        else
                        {
                            paramValue = filter.Field.ToLower() switch
                            {
                                "amount" or "totalrate" => decimal.TryParse(filter.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out var d) ? d : 0m,

                                "createdat" => DateTime.TryParse(filter.Value, CultureInfo.InvariantCulture, out var dt) ? dt : DateTime.UtcNow,

                                _ => filter.Value
                            };
                        }

                        sqlBuilder.Append($" AND {dbField} {op} {paramName}");
                        parameters.Add(paramName, paramValue);
                    }
                }
            }

            var countSql = "SELECT COUNT(*) " + sqlBuilder.ToString();
            var totalCount = await db.ExecuteScalarAsync<int>(countSql, parameters);

            var sortBy = columnMap.TryGetValue(request.SortBy ?? "", out var sortField) ? sortField : "o.created_at";
            var direction = request.SortDescending ? "DESC" : "ASC";

            sqlBuilder.Append($" ORDER BY {sortBy} {direction} LIMIT @PageSize OFFSET @Offset");
            parameters.Add("PageSize", request.PageSize);
            parameters.Add("Offset", (request.Page - 1) * request.PageSize);

            var selectSql = @"
                SELECT 
                    o.id as Id, 
                    o.order_number as OrderNumber, 
                    o.amount as Amount, 
                    o.amount_with_tax as AmountWithTax, 
                    tr.total_rate as TotalRate, 
                    tr.tax_region_name as TaxRegionName,
                    o.created_at as CreatedAt "
                + sqlBuilder.ToString();

            var items = await db.QueryAsync<OrderListDto>(selectSql, parameters);

            return new PagedResult<OrderListDto>(items.AsList(), totalCount, request.Page, request.PageSize);
        }
    }
}