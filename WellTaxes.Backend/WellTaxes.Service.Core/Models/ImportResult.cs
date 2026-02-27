namespace WellTaxes.Service.Core.Models
{
    public class ImportResult
    {
        public int TotalRecords { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public List<ImportError> Errors { get; set; } = new();
    }

    public class ImportError
    {
        public int RowNumber { get; set; }
        public string? RecordId { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
