namespace WellTaxes.Service.Orders.Data.Entities
{
    public class Order : IBaseEntity
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public decimal AmountWithTax { get; set; }
        public OrderStatus Status { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
