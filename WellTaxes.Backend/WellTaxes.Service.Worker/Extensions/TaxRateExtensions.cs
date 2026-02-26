using Npgsql;
using WellTaxes.Service.Worker.Models;

namespace WellTaxes.Service.Worker.Extensions
{
    public static class TaxRateExtensions
    {
        public static async Task InsertToDbAsync(this NpgsqlConnection db, TaxRateCsv taxRate, Guid jurisdictionId)
        {
            if (taxRate == null) throw new ArgumentNullException(nameof(taxRate));

            var sql = @"
                INSERT INTO tax_rates
                (
                    state, zipcode, tax_region_name, total_rate,
                    state_rate, estimated_county_rate, estimated_city_rate, estimated_special_rate,
                    jurisdiction_id, valid_from
                )
                VALUES
                (
                    @State, @ZipCode, @TaxRegionName, @TotalRate,
                    @StateRate, @CountyRate, @CityRate, @SpecialRate,
                    @JurisdictionId, @ValidFrom
                );
            ";

            var totalRate = taxRate.StateRate + taxRate.EstimatedCountyRate + taxRate.EstimatedCityRate + taxRate.EstimatedSpecialRate;

            using var cmd = new NpgsqlCommand(sql, db);
            cmd.Parameters.AddWithValue("State", taxRate.State);
            cmd.Parameters.AddWithValue("ZipCode", taxRate.ZipCode);
            cmd.Parameters.AddWithValue("TaxRegionName", taxRate.TaxRegionName);
            cmd.Parameters.AddWithValue("TotalRate", totalRate);
            cmd.Parameters.AddWithValue("StateRate", taxRate.StateRate);
            cmd.Parameters.AddWithValue("CountyRate", taxRate.EstimatedCountyRate);
            cmd.Parameters.AddWithValue("CityRate", taxRate.EstimatedCityRate);
            cmd.Parameters.AddWithValue("SpecialRate", taxRate.EstimatedSpecialRate);
            cmd.Parameters.AddWithValue("JurisdictionId", jurisdictionId);
            cmd.Parameters.AddWithValue("ValidFrom", new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc));

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
