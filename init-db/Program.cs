using init_db.Logic;
using init_db.Models;
using Npgsql;

namespace init_db
{
    public class Program
    {
        static async Task Main(string[] args)
        {
            var geoFolder = Path.Combine(AppContext.BaseDirectory, "Data", "Geo");
            var taxFolder = Path.Combine(AppContext.BaseDirectory, "Data", "Tax");
            var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
            if (string.IsNullOrWhiteSpace(connStr))
            {
                Console.WriteLine("Встанови ConnectionStrings__DefaultConnection у змінних середовища!");
                return;
            }

            await using var conn = new NpgsqlConnection(connStr);
            var dbAdmin = new DbAdmin(conn);
            await dbAdmin.WaitForDb();

            if (!await dbAdmin.Exists())
            {
                await dbAdmin.RunSqlFile("init.sql");
            }
            Console.WriteLine("Database scheme is prepeared!");

            var hasJurisdictions = await dbAdmin.HasJurisdictions();
            var hasTaxRates = await dbAdmin.HasTaxRates();

            if (!hasTaxRates || !hasJurisdictions)
            {
                List<CreatedJurisdiction> createdJurisdictions;
                if (!hasJurisdictions)
                {
                    var shpFilePath = Directory.GetFiles(geoFolder, "*.shp", SearchOption.AllDirectories).First();
                    var jurisdictions = ShapeFileService.ReadJurisdictionsFromShapefile(shpFilePath);
                    createdJurisdictions = await dbAdmin.CreateJurisdictions(jurisdictions);
                    Console.WriteLine($"Created jurisdictions {createdJurisdictions.Count}.");
                }
                else
                {
                    createdJurisdictions = await dbAdmin.GetCreatedJurisdictions();
                }

                var csvFilesDict = Directory.GetFiles(taxFolder, "*.csv", SearchOption.TopDirectoryOnly)
                    .Select(filePath =>
                    {
                        var fileName = Path.GetFileNameWithoutExtension(filePath);
                        return (filePath, year: int.TryParse(fileName, out var yearInt) ? (int?)yearInt : null);
                    })
                    .Where(t => t.year.HasValue)
                    .OrderBy(t => t.year)
                    .ToArray();

                for (var i = 0; i < csvFilesDict.Length; i++) {
                    var (filePath, year) = csvFilesDict[i];
                    if (!await dbAdmin.HasTaxRatesForYear(year!.Value))
                    {
                        var taxes = ExcelReader.ReadTaxCsv(filePath);
                        var nextYear = i + 1 < csvFilesDict.Length? csvFilesDict[i + 1].year: null;
                        await dbAdmin.FillOrdersBulk(createdJurisdictions, taxes, year.Value, nextYear);
                        Console.WriteLine($"Created {taxes.Count} taxes for {year.Value} - {nextYear}");
                    }
                }
            }


            Console.WriteLine("Database is successfully initialized!");
        }
    }
}
