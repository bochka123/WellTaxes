using CsvHelper;
using CsvHelper.Configuration;
using Dapper;
using Microsoft.Extensions.Hosting;
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
        private const string sourcePath = @"D:\Programming\Test\tl_2020_us_zcta510.shp";
        private const string outputPath = @"D:\Programming\Test\NewYorkArea.shp";
        private const string taxesFilePath = @"D:\Programming\Test\TAXRATES_ZIP5_NY202602.csv";
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var taxes = ReadTaxCsv(taxesFilePath);
                CreateNewYorkFile(taxes);
                //await db.OpenAsync();

                //var version = await db.QuerySingleAsync<string>("SELECT version();");
                //Console.WriteLine(version);
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        private void CreateNewYorkFile(List<TaxRecord> taxes)
        {
            var factory = new GeometryFactory();

            // Читаємо shapefile
            using var reader = new ShapefileDataReader(sourcePath, factory);

            // Створюємо новий header тільки з потрібними полями
            var header = new DbaseFileHeader();
            header.AddColumn("ZipCode", 'C', 5, 0);
            header.AddColumn("StateRate", 'N', 6, 3);
            header.AddColumn("CountyRate", 'N', 6, 3);
            header.AddColumn("CityRate", 'N', 6, 3);
            header.AddColumn("SpecialRate", 'N', 6, 3);
            header.AddColumn("TotalRate", 'N', 6, 3);

            // Створюємо writer і вказуємо header
            var writer = new ShapefileDataWriter(outputPath, factory)
            {
                Header = header
            };

            var features = new List<Feature>();

            while (reader.Read())
            {
                string zipcode = reader.GetString(reader.GetOrdinal("ZCTA5CE10"));
                var foundTax = taxes.FirstOrDefault(x => x.ZipCode == zipcode);
                if (foundTax == null) continue;

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
