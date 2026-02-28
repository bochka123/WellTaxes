using BenchmarkDotNet.Running;
using Dapper;
using MediatR;
using Npgsql;
using WellTaxes.Service.Core.Queries;
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
                BenchmarkRunner.Run<ImportBenchmark>();
                //await db.OpenAsync(stoppingToken);

            //    // 1. Отримуємо наявні ставки, щоб випадково обирати їх і рахувати ціну з податком
            //    var taxRates = (await db.QueryAsync<(Guid Id, decimal TotalRate)>(
            //        "SELECT id, total_rate FROM tax_rates")).ToList();

            //    if (!taxRates.Any())
            //    {
            //        Console.WriteLine("Помилка: Таблиця tax_rates порожня. Спочатку заповни її!");
            //        return;
            //    }

            //    // 2. Твій Object ID (скопіюй повний GUID зі свого скриншота дебагера)
            //    var myUserId = Guid.Parse("0e8bfad1-04b1-4935-9b5c-73f81998692e"); // <-- ЗАМІНИ НА СВІЙ
            //    var random = new Random();
            //    var orders = new List<dynamic>();

            //    Console.WriteLine("Генеруємо 5000 замовлень...");

            //    // 3. Генеруємо дані
            //    for (int i = 0; i < 5000; i++)
            //    {
            //        // Обираємо випадкову ставку з бази
            //        var randomTaxRate = taxRates[random.Next(taxRates.Count)];

            //        // Генеруємо випадкову ціну від 10 до 110 доларів
            //        var subtotal = (decimal)(random.NextDouble() * 100 + 10);

            //        // Рахуємо суму з податком відповідно до обраної ставки
            //        var amountWithTax = subtotal * (1 + randomTaxRate.TotalRate);

            //        orders.Add(new
            //        {
            //            OrderNumber = $"ORD-{DateTime.UtcNow:yyMMdd}-{i:D5}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
            //            UserId = myUserId,
            //            Amount = Math.Round(subtotal, 2),
            //            AmountWithTax = Math.Round(amountWithTax, 2),

            //            // Зразкові координати для штату Нью-Йорк
            //            Latitude = (decimal)(40.5 + random.NextDouble() * 4.5),
            //            Longitude = (decimal)(-79.0 + random.NextDouble() * 7.0),

            //            TaxRatesId = randomTaxRate.Id
            //        });
            //    }

            //    // 4. Масова вставка через Dapper
            //    var sql = @"
            //INSERT INTO orders (order_number, user_id, amount, amount_with_tax, latitude, longitude, tax_rates_id, created_at, updated_at)
            //VALUES (@OrderNumber, @UserId, @Amount, @AmountWithTax, @Latitude, @Longitude, @TaxRatesId, NOW(), NOW())";

            //    // Dapper автоматично розіб'є список об'єктів на ефективні параметризовані запити
            //    await db.ExecuteAsync(sql, orders);

            //    Console.WriteLine("Успішно додано 5000 замовлень у базу!");

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
