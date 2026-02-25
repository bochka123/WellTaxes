namespace WellTaxes.Service.Worker
{
    public partial class Worker
    {
        public class Jurisdiction
        {
            public string Name { get; set; } = string.Empty;
            public decimal TaxRate { get; set; }
        }
    }
}
