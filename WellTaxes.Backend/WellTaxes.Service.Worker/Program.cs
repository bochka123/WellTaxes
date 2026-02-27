using Npgsql;
using System.Text;
using WellTaxes.Service.Core.Quries;

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
            builder.Services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssemblies(typeof(GetJurisdictionsQuery).Assembly);
            });

            builder.Services.AddTransient(sp =>
            {
                var config = sp.GetRequiredService<IConfiguration>();
                var connStr = config.GetConnectionString("DefaultConnection");
                return new NpgsqlConnection(connStr);
            });

            var host = builder.Build();
            host.Run();
        }
    }
}