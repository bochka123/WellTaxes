using CsvHelper;
using CsvHelper.Configuration;
using Dapper;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Globalization;
using WellTaxes.Service.Core.Interfaces;
using WellTaxes.Service.Core.Models;

namespace WellTaxes.Service.Core.Services
{
    public class OrderImportService(NpgsqlConnection db, IUserContext userContext, ILogger<OrderImportService> logger) : IOrderImportService
    {
        public async Task<ImportResult> ImportOrdersFromCsvAsync(Stream csvStream, CancellationToken cancellationToken = default)
        {
            var result = new ImportResult();
            var userId = userContext.UserId;
            var rowNumber = 1;

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                Delimiter = ",",
                MissingFieldFound = null,
                BadDataFound = context =>
                {
                    logger.LogWarning("Bad data found at row {Row}: {RawRecord}", context.Context.Parser.Row, context.RawRecord);
                }
            };

            try
            {
                using var reader = new StreamReader(csvStream);
                using var csv = new CsvReader(reader, config);

                var records = csv.GetRecordsAsync<OrderCsvRecord>(cancellationToken);

                await foreach (var record in records.WithCancellation(cancellationToken))
                {
                    rowNumber++;
                    result.TotalRecords++;

                    try
                    {
                        await CreateOrderFromCsvRecordAsync(record, userId);
                        result.SuccessCount++;
                    }
                    catch (Exception ex)
                    {
                        result.FailedCount++;
                        result.Errors.Add(new ImportError
                        {
                            RowNumber = rowNumber,
                            RecordId = record.Id,
                            ErrorMessage = ex.Message
                        });

                        logger.LogError(ex, "Failed to import order at row {Row}, ID: {Id}", rowNumber, record.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to read CSV file");
                throw new InvalidOperationException("Failed to read CSV file", ex);
            }

            logger.LogInformation(
                "Import completed. Total: {Total}, Success: {Success}, Failed: {Failed}",
                result.TotalRecords, result.SuccessCount, result.FailedCount);

            return result;
        }

        private async Task CreateOrderFromCsvRecordAsync(OrderCsvRecord record, Guid userId)
        {
            var taxLookupSql = @"
                SELECT tr.id as TaxRatesId, tr.total_rate as TotalRate
                FROM tax_rates tr
                JOIN jurisdictions j ON tr.jurisdiction_id = j.id
                WHERE ST_Contains(j.geom, ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4269))
                  AND @OrderTimestamp >= tr.valid_from 
                  AND (@OrderTimestamp < tr.valid_to OR tr.valid_to IS NULL)
                LIMIT 1";

            var taxInfo = await db.QueryFirstOrDefaultAsync<dynamic>(taxLookupSql, new
            {
                Longitude = record.Longitude,
                Latitude = record.Latitude,
                OrderTimestamp = record.Timestamp
            });

            if (taxInfo == null)
            {
                throw new InvalidOperationException(
                    $"No tax jurisdiction found for coordinates ({record.Latitude}, {record.Longitude}) at {record.Timestamp}");
            }

            var totalRate = (decimal)taxInfo.totalrate;
            var amountWithTax = record.Subtotal * (1 + totalRate);
            var orderNumber = string.IsNullOrWhiteSpace(record.Id)
                ? $"ORD-{record.Timestamp:yyMMddHHmmss}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                : $"ORD-{record.Id}";
            var taxRatesId = (Guid)taxInfo.taxratesid;

            // Insert order
            var insertSql = @"
                INSERT INTO orders (order_number, user_id, amount, amount_with_tax, latitude, longitude, tax_rates_id, ""timestamp"", created_at, updated_at)
                VALUES (@OrderNumber, @UserId, @Amount, @AmountWithTax, @Latitude, @Longitude, @TaxRatesId, @Timestamp, NOW(), NOW())
                ON CONFLICT (order_number) DO NOTHING";

            var rowsAffected = await db.ExecuteAsync(insertSql, new
            {
                OrderNumber = orderNumber,
                UserId = userId,
                Amount = record.Subtotal,
                AmountWithTax = amountWithTax,
                Latitude = record.Latitude,
                Longitude = record.Longitude,
                TaxRatesId = taxRatesId,
                Timestamp = record.Timestamp
            });

            if (rowsAffected == 0)
            {
                throw new InvalidOperationException($"Order with number {orderNumber} already exists");
            }
        }
    }
}
