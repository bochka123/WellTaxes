namespace WellTaxes.Service.Core.Entities
{
    public class Order : BaseEntity
    {
        public string OrderNumber { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public decimal AmountWithTax { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public Guid TaxRatesId { get; set; } //foreign key on tax rate
        public DateTime Timestamp { get; set; }
    }
}
