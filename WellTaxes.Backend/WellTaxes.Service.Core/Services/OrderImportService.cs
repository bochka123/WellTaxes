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

                    if (batch.Count >= BatchSize)
                    {
                        await ProcessBatchAsync(batch, userId, result, cancellationToken);
                        batch.Clear();
                    }
                }

                if (batch.Count > 0)
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
            List<(int RowNumber, OrderCsvRecord Record)> batch,
            Guid userId,
            ImportResult result,
            CancellationToken cancellationToken)
        {
            var lats = batch.Select(b => b.Record.Latitude).ToArray();
            var lons = batch.Select(b => b.Record.Longitude).ToArray();
            var timestamps = batch.Select(b => b.Record.Timestamp).ToArray();

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

            var taxRows = (await db.QueryAsync<TaxLookupRow>(taxLookupSql, new
            {
                Lats = lats,
                Lons = lons,
                Timestamps = timestamps
            })).ToDictionary(r => (int)r.Index - 1);

            var ordersToInsert = new List<OrderInsertRow>(batch.Count);

            for (var i = 0; i < batch.Count; i++)
            {
                var (rowNumber, record) = batch[i];

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
                    ? $"ORD-{record.Timestamp:yyMMddHHmmss}-{Guid.NewGuid().ToString()[..4].ToUpper()}"
                    : $"ORD-{record.Id}";

                ordersToInsert.Add(new OrderInsertRow(
                    orderNumber, userId, record.Subtotal, amountWithTax,
                    record.Latitude, record.Longitude,
                    tax.TaxRatesId, record.Timestamp, rowNumber, record.Id));
            }

            if (ordersToInsert.Count == 0)
                return;

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
                foreach (var o in ordersToInsert)
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
            }
            catch (PostgresException pgEx) when (pgEx.SqlState == "23505")
            {
                await FallbackRowByRowInsertAsync(ordersToInsert, result, cancellationToken);
                return;
            }
            finally
            {
                await db.CloseAsync();
            }

            // All rows written successfully
            result.SuccessCount += ordersToInsert.Count;
        }

        /// <summary>
        /// Called only when the COPY hits a duplicate; retries each row individually
        /// so callers get precise per-row duplicate errors.
        /// </summary>
        private async Task FallbackRowByRowInsertAsync(
            List<OrderInsertRow> orders,
            ImportResult result,
            CancellationToken cancellationToken)
        {
            const string insertSql = @"
                INSERT INTO orders
                    (order_number, user_id, amount, amount_with_tax,
                     latitude, longitude, tax_rates_id, ""timestamp"", created_at, updated_at)
                VALUES
                    (@OrderNumber, @UserId, @Amount, @AmountWithTax,
                     @Latitude, @Longitude, @TaxRatesId, @Timestamp, NOW(), NOW())
                ON CONFLICT (order_number) DO NOTHING";

            foreach (var o in orders)
            {
                cancellationToken.ThrowIfCancellationRequested();
                try
                {
                    var rows = await db.ExecuteAsync(insertSql, new
                    {
                        o.OrderNumber,
                        o.UserId,
                        o.Amount,
                        o.AmountWithTax,
                        o.Latitude,
                        o.Longitude,
                        o.TaxRatesId,
                        o.Timestamp
                    });

                    if (rows == 0)
                    {
                        result.FailedCount++;
                        result.Errors.Add(new ImportError
                        {
                            RowNumber = o.RowNumber,
                            RecordId = o.RecordId,
                            ErrorMessage = $"Order {o.OrderNumber} already exists"
                        });
                    }
                    else
                    {
                        result.SuccessCount++;
                    }
                }
                catch (Exception ex)
                {
                    result.FailedCount++;
                    result.Errors.Add(new ImportError
                    {
                        RowNumber = o.RowNumber,
                        RecordId = o.RecordId,
                        ErrorMessage = ex.Message
                    });
                    logger.LogError(ex, "Failed to insert order {OrderNumber}", o.OrderNumber);
                }
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