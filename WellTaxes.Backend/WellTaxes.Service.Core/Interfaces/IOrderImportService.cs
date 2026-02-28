using WellTaxes.Service.Core.Models;

namespace WellTaxes.Service.Core.Interfaces
{
    public interface IOrderImportService
    {
        Task<ImportResult> ImportOrdersFromCsvAsync(Stream csvStream, CancellationToken cancellationToken = default);
    }
}
