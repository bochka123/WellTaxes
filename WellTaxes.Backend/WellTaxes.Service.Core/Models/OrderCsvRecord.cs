using CsvHelper.Configuration.Attributes;

namespace WellTaxes.Service.Core.Models
{
    public class OrderCsvRecord
    {
        [Name("id")]
        public string? Id { get; set; }

        [Name("longitude")]
        public decimal Longitude { get; set; }

        [Name("latitude")]
        public decimal Latitude { get; set; }

        [Name("timestamp")]
        public DateTime Timestamp { get; set; }

        [Name("subtotal")]
        public decimal Subtotal { get; set; }
    }
}
