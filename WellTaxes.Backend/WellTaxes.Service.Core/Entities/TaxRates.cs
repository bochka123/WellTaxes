namespace WellTaxes.Service.Core.Entities
{
    public class TaxRates
    {
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string TaxRegionName { get; set; }
        public decimal TotalRate { get; set; }
        public decimal StateRate { get; set; }
        public decimal EstimatedCountyRate { get; set; }
        public decimal EstimatedCityRate { get; set; }
        public decimal EstimatedSpecialRate { get; set; }
        public Guid JurisdictionId { get; set; } // foreign key
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
    }
}
