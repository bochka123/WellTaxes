using Dapper;
using MediatR;
using MessagePack;
using Npgsql;

namespace WellTaxes.Service.Core.Queries
{
    [MessagePackObject]
    public class JurisdictionDto
    {
        [Key(0)]
        public string Name { get; set; } = string.Empty;
        [Key(1)]
        public string ZipCode { get; set; } = string.Empty;
        [Key(2)]
        public string GeometryJson { get; set; } = string.Empty;
    }

    public record GetJurisdictionsQuery() : IRequest<IAsyncEnumerable<JurisdictionDto>>;

    public class GetJurisdictionsHandler(NpgsqlConnection db) : IRequestHandler<GetJurisdictionsQuery, IAsyncEnumerable<JurisdictionDto>>
    {
        public async Task<IAsyncEnumerable<JurisdictionDto>> Handle(GetJurisdictionsQuery request, CancellationToken cancellationToken)
        {
            return StreamJurisdictionsAsync(cancellationToken);
        }

        private async IAsyncEnumerable<JurisdictionDto> StreamJurisdictionsAsync(CancellationToken cancellationToken)
        {
            var sql = @"SELECT name, zipcode, ST_AsGeoJSON(geom) AS GeometryJson FROM jurisdictions ORDER BY name";

            await using var reader = await db.ExecuteReaderAsync(sql);

            while (await reader.ReadAsync(cancellationToken))
            {
                yield return new JurisdictionDto
                {
                    Name = reader.GetString(0),
                    ZipCode = reader.GetString(1),
                    GeometryJson = reader.GetString(2)
                };
            }
        }
    }
}
