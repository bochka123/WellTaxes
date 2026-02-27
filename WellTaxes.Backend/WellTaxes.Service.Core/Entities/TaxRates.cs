public class TaxRates
{
    public string State { get; set; } = default!;
    public string ZipCode { get; set; } = default!;
    public string TaxRegionName { get; set; } = default!;
    public decimal TotalRate { get; set; }
    public decimal StateRate { get; set; }
    public decimal EstimatedCountyRate { get; set; }
    public decimal EstimatedCityRate { get; set; }
    public decimal EstimatedSpecialRate { get; set; }
    public Guid JurisdictionId { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}