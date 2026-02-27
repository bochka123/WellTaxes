using NetTopologySuite;
using NetTopologySuite.Features;
using NetTopologySuite.IO;
using WellTaxes.Service.Core.Entities;
using WellTaxes.Service.Worker.Models;

namespace WellTaxes.Service.Worker.Services
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

                // Зчитуємо атрибути
                var name = reader.GetString(reader.GetOrdinal("Name"));
                var zip = reader.GetString(reader.GetOrdinal("ZipCode"));

                jurisdictions.Add(new Jurisdiction
                {
                    Id = Guid.NewGuid(), // можна генерувати новий Id
                    Name = name,
                    ZipCode = zip,
                    Geometry = geom,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            Console.WriteLine($"✅ Loaded {jurisdictions.Count} jurisdictions from shapefile.");

            return jurisdictions;
        }

        public static List<Jurisdiction> CreateJurisdictionsFromShapefile(List<TaxRateCsv> taxes, string sourcePath, string outputPath)
        {
            var factory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4269);
            var jurisdictions = new List<Jurisdiction>();
            var notFoundTaxes = new List<TaxRateCsv>();

            using var reader = new ShapefileDataReader(sourcePath, factory);

            var header = new DbaseFileHeader();
            header.AddColumn("Name", 'C', 50, 0);
            header.AddColumn("ZipCode", 'C', 5, 0);

            var writer = new ShapefileDataWriter(outputPath, factory)
            {
                Header = header
            };

            var features = new List<Feature>();

            var taxByZip = taxes
                .GroupBy(t => t.ZipCode)
                .ToDictionary(g => g.Key, g => g.First());

            while (reader.Read())
            {
                var zipcode = reader.GetString(reader.GetOrdinal("ZCTA5CE20"));
                var foundTax = taxByZip.GetValueOrDefault(zipcode);

                if (foundTax is null)
                {
                    notFoundTaxes.Add(new TaxRateCsv { State = "!NY", ZipCode = zipcode });
                    continue;
                }

                var geom = reader.Geometry;

                var attrs = new AttributesTable
                {
                    { "Name", $"NY ZIP {foundTax.ZipCode}" },
                    { "ZipCode", foundTax.ZipCode }
                };
                features.Add(new Feature(geom, attrs));
                jurisdictions.Add(new Jurisdiction
                {
                    Id = Guid.NewGuid(),
                    Name = $"NY ZIP {foundTax.ZipCode}",
                    ZipCode = foundTax.ZipCode,
                    Geometry = geom,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            writer.Write(features);

            Console.WriteLine($"✅ Created {jurisdictions.Count} jurisdictions. Not found taxes: {notFoundTaxes.Count}");

            return jurisdictions;
        }
    }
}
