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
    public class OrderImportService(
        NpgsqlConnection db,
        IUserContext userContext,
        ILogger<OrderImportService> logger) : IOrderImportService
    {
        private const int BatchSize = 500;

        public async Task<ImportResult> ImportOrdersFromCsvAsync(
            Stream csvStream,
            CancellationToken cancellationToken = default)
        {
            var result = new ImportResult();
            var userId = userContext.UserId;

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                Delimiter = ",",
                MissingFieldFound = null,
                BadDataFound = context =>
                    logger.LogWarning(
                        "Bad data at row {Row}: {RawRecord}",
                        context.Context.Parser.Row,
                        context.RawRecord)
            };

            List<(int RowNumber, OrderCsvRecord Record)> batch = new(BatchSize);

            try
            {
                using var reader = new StreamReader(csvStream);
                using var csv = new CsvReader(reader, config);

                var rowNumber = 1;
                await foreach (var record in csv.GetRecordsAsync<OrderCsvRecord>(cancellationToken))
                {
                    rowNumber++;
                    result.TotalRecords++;
                    batch.Add((rowNumber, record));
                }

                await ProcessBatchAsync(batch, userId, result, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Failed to read CSV file");
                throw new InvalidOperationException("Failed to read CSV file", ex);
            }

            logger.LogInformation(
                "Import completed. Total: {Total}, Success: {Success}, Failed: {Failed}",
                result.TotalRecords, result.SuccessCount, result.FailedCount);

            return result;
        }

        private async Task ProcessBatchAsync(
    List<(int RowNumber, OrderCsvRecord Record)> allRows,
    Guid userId,
    ImportResult result,
    CancellationToken cancellationToken)
        {
            var lats = allRows.Select(b => b.Record.Latitude).ToArray();
            var lons = allRows.Select(b => b.Record.Longitude).ToArray();
            var timestamps = allRows.Select(b => b.Record.Timestamp).ToArray();

            const string taxLookupSql = @"
        SELECT
            idx                     AS Index,
            tr.id                   AS TaxRatesId,
            tr.total_rate           AS TotalRate
        FROM unnest(@Lats, @Lons, @Timestamps) WITH ORDINALITY
                 AS input(lat, lon, ts, idx)
        JOIN jurisdictions j
            ON ST_Contains(j.geom, ST_SetSRID(ST_MakePoint(input.lon, input.lat), 4269))
        JOIN tax_rates tr
            ON  tr.jurisdiction_id = j.id
            AND input.ts >= tr.valid_from
            AND (input.ts < tr.valid_to OR tr.valid_to IS NULL)";

            logger.LogInformation("Looking up tax info for {Count} records", allRows.Count);
            var taxRows = (await db.QueryAsync<TaxLookupRow>(taxLookupSql, new
            {
                Lats = lats,
                Lons = lons,
                Timestamps = timestamps
            })).ToDictionary(r => (int)r.Index - 1);

            var ordersToInsert = new List<OrderInsertRow>(allRows.Count);

            var shortUserId = userId.ToString()[..4].ToUpper();

            for (var i = 0; i < allRows.Count; i++)
            {
                var (rowNumber, record) = allRows[i];

                if (!taxRows.TryGetValue(i, out var tax))
                {
                    result.FailedCount++;
                    result.Errors.Add(new ImportError
                    {
                        RowNumber = rowNumber,
                        RecordId = record.Id,
                        ErrorMessage =
                            $"No tax jurisdiction found for coordinates " +
                            $"({record.Latitude}, {record.Longitude}) at {record.Timestamp}"
                    });
                    logger.LogWarning(
                        "No tax jurisdiction for row {Row}, ID: {Id}", rowNumber, record.Id);
                    continue;
                }

                var amountWithTax = record.Subtotal * (1 + tax.TotalRate);

                var orderNumber = string.IsNullOrWhiteSpace(record.Id)
                    ? $"ORD-{shortUserId}-{record.Timestamp:yyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                    : $"ORD-{shortUserId}-{record.Id}";

                ordersToInsert.Add(new OrderInsertRow(
                    orderNumber, userId, record.Subtotal, amountWithTax,
                    record.Latitude, record.Longitude,
                    tax.TaxRatesId, record.Timestamp, rowNumber, record.Id));
            }

            if (ordersToInsert.Count == 0)
            {
                logger.LogWarning("No valid orders to insert");
                return;
            }

            logger.LogInformation("Inserting {Count} valid orders in batches of {BatchSize}",
                ordersToInsert.Count, BatchSize);

            var totalBatches = (int)Math.Ceiling(ordersToInsert.Count / (double)BatchSize);

            for (var batchIndex = 0; batchIndex < totalBatches; batchIndex++)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var batchOrders = ordersToInsert
                    .Skip(batchIndex * BatchSize)
                    .Take(BatchSize)
                    .ToList();

                logger.LogInformation("Processing batch {Current}/{Total} with {Count} orders",
                    batchIndex + 1, totalBatches, batchOrders.Count);

                await InsertBatchAsync(batchOrders, result, cancellationToken);
            }

            logger.LogInformation("Completed inserting allRows batches");
        }

        private async Task InsertBatchAsync(
            List<OrderInsertRow> batchOrders,
            ImportResult result,
            CancellationToken cancellationToken)
        {
            await db.OpenAsync(cancellationToken);
            try
            {
                await using var writer = await db.BeginBinaryImportAsync(
                    @"COPY orders (order_number, user_id, amount, amount_with_tax,
                                   latitude, longitude, tax_rates_id, ""timestamp"",
                                   created_at, updated_at)
                      FROM STDIN (FORMAT BINARY)",
                    cancellationToken);

                var now = DateTime.UtcNow;
                foreach (var o in batchOrders)
                {
                    await writer.StartRowAsync(cancellationToken);
                    await writer.WriteAsync(o.OrderNumber, NpgsqlTypes.NpgsqlDbType.Text, cancellationToken);
                    await writer.WriteAsync(o.UserId, NpgsqlTypes.NpgsqlDbType.Uuid, cancellationToken);
                    await writer.WriteAsync(o.Amount, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                    await writer.WriteAsync(o.AmountWithTax, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                    await writer.WriteAsync(o.Latitude, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                    await writer.WriteAsync(o.Longitude, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                    await writer.WriteAsync(o.TaxRatesId, NpgsqlTypes.NpgsqlDbType.Uuid, cancellationToken);
                    await writer.WriteAsync(o.Timestamp, NpgsqlTypes.NpgsqlDbType.TimestampTz, cancellationToken);
                    await writer.WriteAsync(now, NpgsqlTypes.NpgsqlDbType.TimestampTz, cancellationToken);
                    await writer.WriteAsync(now, NpgsqlTypes.NpgsqlDbType.TimestampTz, cancellationToken);
                }

                await writer.CompleteAsync(cancellationToken);

                // All rows in this batch written successfully
                result.SuccessCount += batchOrders.Count;
                logger.LogInformation("Successfully inserted {Count} orders", batchOrders.Count);
            }
            catch (PostgresException pgEx) when (pgEx.SqlState == "23505")
            {
                logger.LogWarning("Duplicate key detected in batch with {Count} orders", batchOrders.Count);
                result.FailedCount += batchOrders.Count;

                foreach (var o in batchOrders)
                {
                    result.Errors.Add(new ImportError
                    {
                        RowNumber = o.RowNumber,
                        RecordId = o.RecordId,
                        ErrorMessage = "Batch failed due to duplicate order number"
                    });
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to insert batch with {Count} orders", batchOrders.Count);
                result.FailedCount += batchOrders.Count;

                foreach (var o in batchOrders)
                {
                    result.Errors.Add(new ImportError
                    {
                        RowNumber = o.RowNumber,
                        RecordId = o.RecordId,
                        ErrorMessage = $"Batch insert failed: {ex.Message}"
                    });
                }
            }
            finally
            {
                await db.CloseAsync();
            }
        }

        private sealed class TaxLookupRow
        {
            public long Index { get; init; }
            public Guid TaxRatesId { get; init; }
            public decimal TotalRate { get; init; }
        }

        private sealed record OrderInsertRow(
            string OrderNumber,
            Guid UserId,
            decimal Amount,
            decimal AmountWithTax,
            decimal Latitude,
            decimal Longitude,
            Guid TaxRatesId,
            DateTime Timestamp,
            int RowNumber,
            string? RecordId);
    }
}