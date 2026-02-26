using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using WellTaxes.Service.Worker.Models;

namespace WellTaxes.Service.Worker.Services
{
    public static class ExcelReader
    {
        public static List<TaxRateCsv> ReadTaxCsv(string filePath)
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

            var records = csv.GetRecords<TaxRateCsv>().ToList();
            return records;
        }
    }
}
