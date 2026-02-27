using Dapper;
using MediatR;
using Npgsql;

namespace WellTaxes.Service.Core.Quries
{
    public class JurisdictionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string GeometryJson { get; set; } = string.Empty;
    }
    public record GetJurisdictionsQuery() : IRequest<List<JurisdictionDto>>;
    public class GetJurisdictionsHandler(NpgsqlConnection db) : IRequestHandler<GetJurisdictionsQuery, List<JurisdictionDto>>
    {
        public async Task<List<JurisdictionDto>> Handle(GetJurisdictionsQuery request, CancellationToken cancellationToken)
        {
            var sql = @"SELECT name, zipcode, ST_AsGeoJSON(geom) AS GeometryJson FROM jurisdictions";
            var result = await db.QueryAsync<JurisdictionDto>(sql);
            return result.AsList();
        }
    }
}
