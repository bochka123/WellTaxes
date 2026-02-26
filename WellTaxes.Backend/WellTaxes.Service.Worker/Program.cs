using Npgsql;
using System.Text;

namespace WellTaxes.Service.Worker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            Console.OutputEncoding = Encoding.UTF8;
            var builder = Host.CreateApplicationBuilder(args);
            builder.Configuration.AddUserSecrets<Program>();
            builder.Services.AddHostedService<Worker>();

            builder.Services.AddTransient(sp =>
            {
                var config = sp.GetRequiredService<IConfiguration>();
                var connStr = config["DbConnectionString"];
                return new NpgsqlConnection(connStr);
            });

            var host = builder.Build();
            host.Run();
        }
    }
}