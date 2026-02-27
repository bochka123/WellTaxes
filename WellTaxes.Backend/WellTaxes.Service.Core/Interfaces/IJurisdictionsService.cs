using WellTaxes.Service.Core.Queries;

namespace WellTaxes.Service.Core.Interfaces
{
    public interface IJurisdictionsService
    {
        Task<IEnumerable<JurisdictionDto>> GetAllJurisdictionsAsync();
    }
}
