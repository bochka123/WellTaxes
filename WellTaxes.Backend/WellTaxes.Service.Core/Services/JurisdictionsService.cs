using Dapper;
using Microsoft.Extensions.Caching.Memory;
using Npgsql;
using WellTaxes.Service.Core.Constants;
using WellTaxes.Service.Core.Interfaces;
using WellTaxes.Service.Core.Queries;

namespace WellTaxes.Service.Core.Services
{
    public class JurisdictionsService(NpgsqlConnection db, IMemoryCache memoryCache) : IJurisdictionsService
    {
        public async Task<IEnumerable<JurisdictionDto>> GetAllJurisdictionsAsync()
        {
            var cachedResult = memoryCache.Get<List<JurisdictionDto>>(CacheKeyConstants.AllJurisdictions);

            if (cachedResult == null)
            {
                var sql = @"SELECT name, zipcode, ST_AsGeoJSON(geom) AS GeometryJson FROM jurisdictions";
                var result = await db.QueryAsync<JurisdictionDto>(sql);

                cachedResult = memoryCache.Set(CacheKeyConstants.AllJurisdictions, result.AsList(), TimeSpan.FromMinutes(10));
            }

            return cachedResult;
        }
    }
}
