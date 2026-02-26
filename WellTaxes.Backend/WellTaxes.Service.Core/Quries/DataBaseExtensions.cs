using Dapper;
using Npgsql;

namespace WellTaxes.Service.Core.Quries
{
    public static class DataBaseExtensions
    {
        public class JurisdictionDto
        {
            public string Name { get; set; } = string.Empty;
            public string ZipCode { get; set; } = string.Empty;
            public string GeometryJson { get; set; } = string.Empty;
        }
        public static async Task<List<JurisdictionDto>> GetJurisdictionsAsync(this NpgsqlConnection db)
        {
            var sql = @"SELECT name, zipcode, ST_AsGeoJSON(geom) AS GeometryJson FROM jurisdictions";

            return [.. (await db.QueryAsync<JurisdictionDto>(sql))];
        }
    }
}
