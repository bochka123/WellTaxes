using MediatR;
using Npgsql;
using WellTaxes.Service.Core.Entities;
using WellTaxes.Service.Core.Quries;
using WellTaxes.Service.Worker.Extensions;
using WellTaxes.Service.Worker.Models;
using WellTaxes.Service.Worker.Services;

namespace WellTaxes.Service.Worker
{

    public partial class Worker(NpgsqlConnection db, IMediator mediator, ILogger<Worker> logger) : BackgroundService
    {
        private const string sourcePath = @"D:\Programming\Test\data2025\tl_2025_us_zcta520.shp";
        private const string outputPath = @"D:\Programming\Test\York2026\NewYorkArea.shp";
        private const string taxesFilePath = @"D:\Programming\Test\TAXRATES_ZIP5_NY202602.csv";
        private async Task TestSQL()
        {
            try
            {
                Console.WriteLine("Opening connection...");
                await db.OpenAsync();
                Console.WriteLine("✅ Connected successfully!");

                var sql = @"
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_type = 'BASE TABLE';
                ";

                using var cmd = new NpgsqlCommand(sql, db);
                using var reader = await cmd.ExecuteReaderAsync();

                Console.WriteLine("Tables in public schema:");
                while (await reader.ReadAsync())
                {
                    Console.WriteLine($"- {reader.GetString(0)}");
                }

                await db.CloseAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                Console.WriteLine($"Type: {ex.GetType().Name}");
                Console.WriteLine($"Inner: {ex.InnerException?.Message}");
            }
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var result = await mediator.Send(new GetJurisdictionsQuery());

                //await RunSqlFile(@"D:\Programming\Projects\WellTaxes\WellTaxes.Backend\WellTaxes.Service.Worker\init.sql");
                //await TestSQL();

                //await InsertJurisdictionsToDb(db, jurisdictions);

                //var features = ShapeFileService.CreateJurisdictionsFromShapefile(taxes, sourcePath, outputPath);
                //PolygonPngRenderer.RenderToPng(
                //    path: @"D:\Programming\Test\York2026\NewYorkArea.png",
                //    geometries: features.Select(f => f.Geometry),
                //    width: 2000,
                //    height: 1200
                //);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }


        private async Task RunSqlFile(string filePath)
        {
            var sql = await File.ReadAllTextAsync(filePath);

            await db.OpenAsync();

            using var cmd = new NpgsqlCommand(sql, db);
            await cmd.ExecuteNonQueryAsync();

            await db.CloseAsync();
            Console.WriteLine($"✅ SQL file {filePath} executed successfully!");
        }

        public async Task FillOrders()
        {
            var taxes = ExcelReader.ReadTaxCsv(taxesFilePath);
            var notFoundTaxes = new List<TaxRateCsv>();
            await db.OpenAsync();
            var jurisdictions = await db.GetIdAndZipAsync();
            foreach (var tax in taxes)
            {
                var jurisdiction = jurisdictions.FirstOrDefault(x => x.ZipCode == tax.ZipCode);
                if (jurisdiction == null)
                {
                    notFoundTaxes.Add(tax);
                    continue;
                }

                await db.InsertToDbAsync(tax, jurisdiction.Id);
            }
            await db.CloseAsync();
        }
    }
}
