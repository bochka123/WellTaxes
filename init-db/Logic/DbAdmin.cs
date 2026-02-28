using init_db.Models;
using NetTopologySuite.IO;
using Npgsql;
using NpgsqlTypes;

namespace init_db.Logic
{
    public class DbAdmin(NpgsqlConnection db)
    {
        public async Task<bool> Exists()
        {
            if (db.State != System.Data.ConnectionState.Open)
                await db.OpenAsync();

            await using var checkCmd = new NpgsqlCommand(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jurisdictions');",
                db
            );

            var result = await checkCmd.ExecuteScalarAsync();
            return result is bool exists && exists;
        }
        public async Task RunSqlFile(string filePath)
        {
            var sql = await File.ReadAllTextAsync(filePath);

            var shouldClose = false;
            if (db.State != System.Data.ConnectionState.Open)
            {
                await db.OpenAsync();
                shouldClose = true;
            }

            using var cmd = new NpgsqlCommand(sql, db);
            await cmd.ExecuteNonQueryAsync();

            if (shouldClose)
                await db.CloseAsync();

            Console.WriteLine($"✅ SQL file {filePath} executed successfully!");
        }

        public async Task WaitForDb(int timeoutSeconds = 30)
        {
            var start = DateTime.UtcNow;
            while (true)
            {
                try
                {
                    await db.OpenAsync();
                    await db.CloseAsync();
                    return;
                }
                catch
                {
                    if ((DateTime.UtcNow - start).TotalSeconds > timeoutSeconds)
                        throw;
                    Console.WriteLine("Очікуємо БД...");
                    await Task.Delay(1000);
                }
            }
        }

        public async Task<List<CreatedJurisdiction>> GetCreatedJurisdictions()
        {
            const string sql = @"SELECT id, zipcode FROM public.jurisdictions;";

            var result = new List<CreatedJurisdiction>();

            var shouldClose = false;
            if (db.State != System.Data.ConnectionState.Open)
            {
                await db.OpenAsync();
                shouldClose = true;
            }

            await using (var cmd = new NpgsqlCommand(sql, db))
            await using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    result.Add(new CreatedJurisdiction
                    {
                        Id = reader.GetGuid(0),
                        ZipCode = reader.GetString(1)
                    });
                }
            }

            if (shouldClose)
                await db.CloseAsync();

            return result;
        }

        public async Task<List<CreatedJurisdiction>> CreateJurisdictions(List<Jurisdiction> jurisdictions)
        {
            if (jurisdictions.Count == 0)
                return [];

            if (db.State != System.Data.ConnectionState.Open)
                await db.OpenAsync();

            var wktWriter = new WKTWriter();

            var names = jurisdictions.Select(x => x.Name).ToArray();
            var zipCodes = jurisdictions.Select(x => x.ZipCode).ToArray();
            var wkts = jurisdictions
                .Select(x => x.Geometry is null ? null : wktWriter.Write(x.Geometry))
                .ToArray();

            const string sql = @"
        INSERT INTO public.jurisdictions (name, zipcode, geom)
        SELECT 
            unnest(@names),
            unnest(@zipcodes),
            ST_Multi(ST_SetSRID(ST_GeomFromText(unnest(@wkts)), 4269))
        RETURNING id, zipcode;
    ";

            await using var cmd = new NpgsqlCommand(sql, db);

            cmd.Parameters.AddWithValue("names", NpgsqlDbType.Array | NpgsqlDbType.Text, names);
            cmd.Parameters.AddWithValue("zipcodes", NpgsqlDbType.Array | NpgsqlDbType.Varchar, zipCodes);
            cmd.Parameters.AddWithValue("wkts", NpgsqlDbType.Array | NpgsqlDbType.Text, wkts);

            var result = new List<CreatedJurisdiction>();

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                result.Add(new CreatedJurisdiction
                {
                    Id = reader.GetGuid(0),
                    ZipCode = reader.GetString(1)
                });
            }

            return result;
        }

        public async Task FillOrdersBulk(
            List<CreatedJurisdiction> jurisdictions,
            List<TaxRateCsv> taxes,
            int year,
            int? nextYear = null)
        {
            if (taxes.Count == 0)
                return;

            if (db.State != System.Data.ConnectionState.Open)
                await db.OpenAsync();

            var jurisdictionDict = jurisdictions.ToDictionary(x => x.ZipCode, x => x);

            var validFrom = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            DateTime? validTo = null;

            if (nextYear != null)
                validTo = new DateTime(nextYear.Value, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddSeconds(-1);

            var states = new List<string>();
            var zipCodes = new List<string>();
            var regionNames = new List<string>();
            var totalRates = new List<decimal>();
            var stateRates = new List<decimal>();
            var countyRates = new List<decimal>();
            var cityRates = new List<decimal>();
            var specialRates = new List<decimal>();
            var jurisdictionIds = new List<Guid>();
            var validFroms = new List<DateTime>();
            var validTos = new List<DateTime?>();

            foreach (var tax in taxes)
            {
                if (!jurisdictionDict.TryGetValue(tax.ZipCode, out var jurisdiction))
                    continue;

                var totalRate =
                    tax.StateRate +
                    tax.EstimatedCountyRate +
                    tax.EstimatedCityRate +
                    tax.EstimatedSpecialRate;

                states.Add(tax.State);
                zipCodes.Add(tax.ZipCode);
                regionNames.Add(tax.TaxRegionName);
                totalRates.Add(totalRate);
                stateRates.Add(tax.StateRate);
                countyRates.Add(tax.EstimatedCountyRate);
                cityRates.Add(tax.EstimatedCityRate);
                specialRates.Add(tax.EstimatedSpecialRate);
                jurisdictionIds.Add(jurisdiction.Id);
                validFroms.Add(validFrom);
                validTos.Add(validTo);
            }

            if (states.Count == 0)
                return;

            const string sql = @"
                INSERT INTO tax_rates
                (
                    state, zipcode, tax_region_name, total_rate,
                    state_rate, estimated_county_rate, estimated_city_rate, estimated_special_rate,
                    jurisdiction_id, valid_from, valid_to
                )
                SELECT
                    unnest(@states),
                    unnest(@zipcodes),
                    unnest(@regionNames),
                    unnest(@totalRates),
                    unnest(@stateRates),
                    unnest(@countyRates),
                    unnest(@cityRates),
                    unnest(@specialRates),
                    unnest(@jurisdictionIds),
                    unnest(@validFroms),
                    unnest(@validTos);
            ";

            await using var cmd = new NpgsqlCommand(sql, db);

            cmd.Parameters.AddWithValue("states", states.ToArray());
            cmd.Parameters.AddWithValue("zipcodes", zipCodes.ToArray());
            cmd.Parameters.AddWithValue("regionNames", regionNames.ToArray());
            cmd.Parameters.AddWithValue("totalRates", totalRates.ToArray());
            cmd.Parameters.AddWithValue("stateRates", stateRates.ToArray());
            cmd.Parameters.AddWithValue("countyRates", countyRates.ToArray());
            cmd.Parameters.AddWithValue("cityRates", cityRates.ToArray());
            cmd.Parameters.AddWithValue("specialRates", specialRates.ToArray());
            cmd.Parameters.AddWithValue("jurisdictionIds", jurisdictionIds.ToArray());
            cmd.Parameters.AddWithValue("validFroms", validFroms.ToArray());
            cmd.Parameters.AddWithValue("validTos", validTos.ToArray());

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<bool> HasJurisdictions()
        {
            if (db.State != System.Data.ConnectionState.Open)
                await db.OpenAsync();

            const string sql = "SELECT EXISTS (SELECT 1 FROM public.jurisdictions);";

            await using var cmd = new NpgsqlCommand(sql, db);
            var result = await cmd.ExecuteScalarAsync();

            return result is bool exists && exists;
        }

        public async Task<bool> HasTaxRates()
        {
            if (db.State != System.Data.ConnectionState.Open)
                await db.OpenAsync();

            const string sql = "SELECT EXISTS (SELECT 1 FROM public.tax_rates);";

            await using var cmd = new NpgsqlCommand(sql, db);
            var result = await cmd.ExecuteScalarAsync();

            return result is bool exists && exists;
        }

        public async Task<bool> HasTaxRatesForYear(int year)
        {
            if (db.State != System.Data.ConnectionState.Open)
                await db.OpenAsync();

            const string sql = @"
                SELECT EXISTS (
                    SELECT 1 
                    FROM public.tax_rates
                    WHERE EXTRACT(YEAR FROM valid_from) = @Year
                );";

            await using var cmd = new NpgsqlCommand(sql, db);
            cmd.Parameters.AddWithValue("Year", year);

            var result = await cmd.ExecuteScalarAsync();

            return result is bool exists && exists;
        }
    }
}
