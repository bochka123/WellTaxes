using CsvHelper.Configuration.Attributes;
using CsvHelper.TypeConversion;
using CsvHelper;
using CsvHelper.Configuration;

namespace WellTaxes.Service.Core.Models
{
    public class OrderCsvRecord
    {
        [Name("id")]
        public string? Id { get; set; }

        [Name("longitude")]
        public decimal Longitude { get; set; }

        [Name("latitude")]
        public decimal Latitude { get; set; }

        [Name("timestamp")]
        [TypeConverter(typeof(UtcDateTimeConverter))]
        public DateTime Timestamp { get; set; }

        [Name("subtotal")]
        public decimal Subtotal { get; set; }
    }

    public sealed class UtcDateTimeConverter : DateTimeConverter
    {
        public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            var dt = (DateTime?)base.ConvertFromString(text, row, memberMapData);
            if (dt is null) return null;

            return dt.Value.Kind switch
            {
                DateTimeKind.Utc => dt.Value,
                DateTimeKind.Local => dt.Value.ToUniversalTime(),
                DateTimeKind.Unspecified => DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc),
                _ => dt.Value
            };
        }
    }
}
