using init_db.Models;
using NetTopologySuite;
using NetTopologySuite.IO;


namespace init_db.Logic
{
    public static class ShapeFileService
    {
        public static List<Jurisdiction> ReadJurisdictionsFromShapefile(string filePath)
        {
            var factory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4269);
            var jurisdictions = new List<Jurisdiction>();

            using var reader = new ShapefileDataReader(filePath, factory);

            while (reader.Read())
            {
                var geom = reader.Geometry;
                var name = reader.GetString(reader.GetOrdinal("Name"));
                var zip = reader.GetString(reader.GetOrdinal("ZipCode"));

                jurisdictions.Add(new Jurisdiction
                {
                    Name = name,
                    ZipCode = zip,
                    Geometry = geom
                });
            }

            Console.WriteLine($"✅ Loaded {jurisdictions.Count} jurisdictions from shapefile.");

            return jurisdictions;
        }
    }
}
