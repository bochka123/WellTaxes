using MediatR;
using WellTaxes.Service.Core.Interfaces;

namespace WellTaxes.Service.Core.Queries
{
    public class JurisdictionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string GeometryJson { get; set; } = string.Empty;
    }
    public record GetJurisdictionsQuery() : IRequest<IEnumerable<JurisdictionDto>>;
    public class GetJurisdictionsHandler(IJurisdictionsService jurisdictionsService) : IRequestHandler<GetJurisdictionsQuery, IEnumerable<JurisdictionDto>>
    {
        public async Task<IEnumerable<JurisdictionDto>> Handle(GetJurisdictionsQuery request, CancellationToken cancellationToken)
        {
            return await jurisdictionsService.GetAllJurisdictionsAsync();
        }
    }
}