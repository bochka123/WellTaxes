using Npgsql;

namespace WellTaxes.Service.Worker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = Host.CreateApplicationBuilder(args);

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