using NetTopologySuite.Geometries;

namespace init_db.Models
{
    public class Jurisdiction
    {
        public required string Name { get; set; }
        public required string ZipCode { get; set; }
        public Geometry? Geometry { get; set; }
    }
    public class CreatedJurisdiction() 
    {
        public Guid Id { get; set; }
        public required string ZipCode { get; set; }
    }
}
