using Dapper;
using MediatR;
using Npgsql;
using WellTaxes.Service.Core.Entities;

namespace WellTaxes.Service.Core.Queries
{
    public record GetTaxRateByLatLongAndTimeStampQuery(decimal longitude, decimal latitude, DateTime timeStamp) : IRequest<TaxRates?>
    {}

    public class GetTaxRateByLatLongAndTimeStampHandler(NpgsqlConnection db): IRequestHandler<GetTaxRateByLatLongAndTimeStampQuery, TaxRates?>
    {
        public async Task<TaxRates?> Handle(
            GetTaxRateByLatLongAndTimeStampQuery request,
            CancellationToken cancellationToken)
        {
            const string sql = @"
                SELECT 
                    tr.state               AS State,
                    tr.zipcode            AS ZipCode,
                    tr.tax_region_name     AS TaxRegionName,
                    tr.total_rate          AS TotalRate,
                    tr.state_rate          AS StateRate,
                    tr.estimated_county_rate  AS EstimatedCountyRate,
                    tr.estimated_city_rate    AS EstimatedCityRate,
                    tr.estimated_special_rate AS EstimatedSpecialRate,
                    tr.jurisdiction_id     AS JurisdictionId,
                    tr.valid_from          AS ValidFrom,
                    tr.valid_to            AS ValidTo
                FROM jurisdictions j
                JOIN tax_rates tr ON tr.jurisdiction_id = j.id
                WHERE ST_Intersects(
                    j.geom,
                    ST_SetSRID(ST_MakePoint(@longitude, @latitude), 4269)
                )
                AND tr.valid_from <= @timestamp
                AND (tr.valid_to IS NULL OR tr.valid_to >= @timestamp)
                ORDER BY tr.valid_from DESC
                LIMIT 1;";

            await db.OpenAsync(cancellationToken);

            return await db.QueryFirstOrDefaultAsync<TaxRates>(
                sql,
                new
                {
                    request.longitude,
                    request.latitude,
                    timestamp = request.timeStamp
                });
        }
    }
}