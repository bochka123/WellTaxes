using CsvHelper;
using CsvHelper.Configuration;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Npgsql;
using System.Globalization;

namespace WellTaxes.Service.Worker
{

    public class TaxRecord
    {
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string TaxRegionName { get; set; }
        public decimal EstimatedCombinedRate { get; set; }
        public decimal StateRate { get; set; }
        public decimal EstimatedCountyRate { get; set; }
        public decimal EstimatedCityRate { get; set; }
        public decimal EstimatedSpecialRate { get; set; }
        public string RiskLevel { get; set; }
    }

    public partial class Worker(NpgsqlConnection db, ILogger<Worker> logger) : BackgroundService
    {
        private const string sourcePath = @"C:\.NET\Test\tl_2025_us_zcta520.shp";
        private const string outputPath = @"C:\.NET\Test\NewYorkArea.shp";
        private const string taxesFilePath = @"C:\.NET\Test\TAXRATES_ZIP5_NY202602.csv";
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var taxes = ReadTaxCsv(taxesFilePath);
                var features = CreateNewYorkFile(taxes);
                PolygonPngRenderer.RenderToPng(
                    path: @"C:\.NET\Test\NewYorkArea.png",
                    geometries: features.Select(f => f.Geometry),
                    width: 2000,
                    height: 1200
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        private List<Feature> CreateNewYorkFile(List<TaxRecord> taxes)
        {
            var factory = new GeometryFactory();

            using var reader = new ShapefileDataReader(sourcePath, factory);

            var header = new DbaseFileHeader();
            header.AddColumn("ZipCode", 'C', 5, 0);
            header.AddColumn("StateRate", 'N', 6, 3);
            header.AddColumn("CountyRate", 'N', 6, 3);
            header.AddColumn("CityRate", 'N', 6, 3);
            header.AddColumn("SpecialRate", 'N', 6, 3);
            header.AddColumn("TotalRate", 'N', 6, 3);

            var writer = new ShapefileDataWriter(outputPath, factory)
            {
                Header = header
            };

            var features = new List<Feature>();
            var notFoundTaxes = new List<TaxRecord>();

            while (reader.Read())
            {
                var taxByZip = taxes
                    .GroupBy(t => t.ZipCode)
                    .ToDictionary(g => g.Key, g => g.First());

                var zipcode = reader.GetString(reader.GetOrdinal("ZCTA5CE20"));
                var foundTax = taxByZip.GetValueOrDefault(zipcode);

                if (foundTax is null)
                {
                    notFoundTaxes.Add(new TaxRecord { State = "!NY", ZipCode = zipcode });
                    continue;
                }

                var geom = reader.Geometry;
                var attrs = new AttributesTable
                {
                    { "ZipCode", foundTax.ZipCode },
                    { "StateRate", foundTax.StateRate },
                    { "CountyRate", foundTax.EstimatedCountyRate },
                    { "CityRate", foundTax.EstimatedCityRate },
                    { "SpecialRate", foundTax.EstimatedSpecialRate },
                    { "TotalRate", foundTax.StateRate + foundTax.EstimatedCountyRate + foundTax.EstimatedCityRate + foundTax.EstimatedSpecialRate }
                };

                features.Add(new Feature(geom, attrs));
            }

            writer.Write(features);

            return features;
        }

        public List<TaxRecord> ReadTaxCsv(string filePath)
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                Delimiter = ",",
                MissingFieldFound = null,
                BadDataFound = null
            };

            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, config);

            var records = csv.GetRecords<TaxRecord>().ToList();
            return records;
        }
    }
}
