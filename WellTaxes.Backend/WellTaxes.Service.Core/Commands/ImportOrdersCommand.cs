using CsvHelper;
using CsvHelper.Configuration;
using Dapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Globalization;
using WellTaxes.Service.Core.Interfaces;
using WellTaxes.Service.Core.Models;

namespace WellTaxes.Service.Core.Commands
{
    public record ImportOrdersCommand(Stream CsvStream) : IRequest<ImportResult>;



    public class ImportOrdersHandler(
        NpgsqlConnection db,
        IUserContext userContext,
        ILogger<ImportOrdersHandler> logger) : IRequestHandler<ImportOrdersCommand, ImportResult>
    {
        private const int BatchSize = 50_000;

        public async Task<ImportResult> Handle(ImportOrdersCommand request, CancellationToken cancellationToken)
        {
            await db.OpenAsync(cancellationToken);

            try
            {
                return await ExecuteLogicAsync(request, cancellationToken);
            }
            finally
            {
                await db.CloseAsync();
            }
        }

        private async Task<ImportResult> ExecuteLogicAsync(ImportOrdersCommand request, CancellationToken cancellationToken)
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
                        context.Context.Parser?.Row,
                        context.RawRecord)
            };

            using var reader = new StreamReader(request.CsvStream);
            using var csv = new CsvReader(reader, config);

            var batch = new List<(int RowNumber, OrderCsvRecord Record)>(BatchSize);
            var rowNumber = 1;

            await CreateTempTableAsync();
            await foreach (var record in csv.GetRecordsAsync<OrderCsvRecord>(cancellationToken))
            {
                rowNumber++;
                result.TotalRecords++;
                batch.Add((rowNumber, record));

                if (batch.Count >= BatchSize)
                {
                    await ProcessBatchAsync(batch, cancellationToken);
                    batch.Clear();
                }
            }

            if (batch.Count > 0)
                await ProcessBatchAsync(batch, cancellationToken);

            result.SuccessCount = await InsertFromTempTableAsync(userId, cancellationToken);
            result.FailedCount = result.TotalRecords - result.SuccessCount;

            logger.LogInformation(
                "Import completed. Total: {Total}, Success: {Success}, Failed: {Failed}",
                result.TotalRecords, result.SuccessCount, result.FailedCount);

            return result;
        }

        private async Task ProcessBatchAsync(
            List<(int RowNumber, OrderCsvRecord Record)> batch,
            CancellationToken cancellationToken)
        {
            if (batch.Count == 0) return;

            await db.ExecuteAsync("TRUNCATE temp_orders");
            await using var writer = await db.BeginBinaryImportAsync(
                "COPY temp_orders (row_num, id, lat, lon, subtotal, ts) FROM STDIN (FORMAT BINARY)",
                cancellationToken);

            foreach (var (rowNum, r) in batch)
            {
                await writer.StartRowAsync(cancellationToken);
                await writer.WriteAsync(rowNum, NpgsqlTypes.NpgsqlDbType.Integer, cancellationToken);
                await writer.WriteAsync(r.Id, NpgsqlTypes.NpgsqlDbType.Text, cancellationToken);
                await writer.WriteAsync(r.Latitude, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                await writer.WriteAsync(r.Longitude, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                await writer.WriteAsync(r.Subtotal, NpgsqlTypes.NpgsqlDbType.Numeric, cancellationToken);
                await writer.WriteAsync(r.Timestamp, NpgsqlTypes.NpgsqlDbType.TimestampTz, cancellationToken);
            }

            await writer.CompleteAsync(cancellationToken);
        }

        private async Task<int> InsertFromTempTableAsync(Guid userId, CancellationToken cancellationToken)
        {
            var inserted = await db.ExecuteAsync(
                new CommandDefinition(@"
            INSERT INTO orders (order_number, user_id, amount, amount_with_tax, latitude, longitude, tax_rates_id, ""timestamp"", created_at, updated_at)
            SELECT
                CASE WHEN t.id IS NULL OR t.id = '' 
                        THEN 'ORD-' || upper(substring(@UserId::text from 1 for 4)) || '-' || to_char(t.ts, 'YYMMDD') || '-' || substring(gen_random_uuid()::text from 1 for 4)
                        ELSE 'ORD-' || upper(substring(@UserId::text from 1 for 4)) || '-' || t.id
                END,
                @UserId,
                t.subtotal,
                t.subtotal * (1 + tr.total_rate),
                t.lat,
                t.lon,
                tr.id,
                t.ts,
                @Now,
                @Now
            FROM temp_orders t
            JOIN jurisdictions j
                ON ST_Contains(j.geom, ST_SetSRID(ST_MakePoint(t.lon, t.lat), 4269))
            JOIN tax_rates tr
                ON tr.jurisdiction_id = j.id
                AND t.ts >= tr.valid_from
                AND (t.ts < tr.valid_to OR tr.valid_to IS NULL)",
                    new { UserId = userId, Now = DateTime.UtcNow },
                    cancellationToken: cancellationToken));

            return inserted;
        }

        private async Task CreateTempTableAsync()
        {
            await db.ExecuteAsync(
                new CommandDefinition(@"
            CREATE TEMP TABLE temp_orders (
                row_num int,
                id text,
                lat numeric,
                lon numeric,
                subtotal numeric,
                ts timestamptz
            ) ON COMMIT PRESERVE ROWS;"));
        }
    }
}
