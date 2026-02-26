using CsvHelper.Configuration.Attributes;

namespace WellTaxes.Service.Worker.Models
{
    public class TaxRateCsv
    {
        [Name("State")]
        public string State { get; set; }

        [Name("ZipCode")]
        public string ZipCode { get; set; }

        [Name("TaxRegionName")]
        public string TaxRegionName { get; set; }

        [Name("EstimatedCombinedRate")]
        public decimal EstimatedCombinedRate { get; set; }

        [Name("StateRate")]
        public decimal StateRate { get; set; }

        [Name("EstimatedCountyRate")]
        public decimal EstimatedCountyRate { get; set; }

        [Name("EstimatedCityRate")]
        public decimal EstimatedCityRate { get; set; }

        [Name("EstimatedSpecialRate")]
        public decimal EstimatedSpecialRate { get; set; }

        [Name("RiskLevel")]
        public string RiskLevel { get; set; }
    }
}
