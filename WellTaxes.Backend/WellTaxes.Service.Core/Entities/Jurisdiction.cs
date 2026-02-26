using NetTopologySuite.Geometries;

namespace WellTaxes.Service.Core.Entities
{
    public class Jurisdiction : BaseEntity
    {
        public required string Name { get; set; }
        public required string ZipCode { get; set; }
        public Geometry? Geometry { get; set; }
    }
}
