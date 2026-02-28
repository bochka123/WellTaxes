using BenchmarkDotNet.Attributes;
using MediatR;
using Npgsql;
using WellTaxes.Service.Core.Commands;
using WellTaxes.Service.Core.Interfaces;
using WellTaxes.Service.Core.Queries;
using WellTaxes.Service.Core.Services;

[MemoryDiagnoser]
public class ImportBenchmark
{
    private IOrderImportService _service;
    private IMediator _mediator;
    private byte[] _csvData;
    private const string connString = "Host=db;Database=postgis;Username=postgisadmin;Password=pass;Port=5432";
    [GlobalSetup]
    public void Setup()
    {
        _csvData = File.ReadAllBytes("TestOrders.csv");
        var services = new ServiceCollection();

        services.AddTransient(sp => new NpgsqlConnection(connString));
        services.AddSingleton<IUserContext>(x =>
        {
            var context = new UserContext();
            context.SetUserId(Guid.Parse("df6fa452-1712-4e84-b580-c9877feac9e3"));
            return context;
        });
        services.AddLogging(builder => builder.AddConsole());
        services.AddScoped<IOrderImportService, OrderImportService>();
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssemblies(typeof(GetJurisdictionsQuery).Assembly);
        });

        var provider = services.BuildServiceProvider();
        _service = provider.GetRequiredService<IOrderImportService>();
        _mediator = provider.GetRequiredService<IMediator>();
    }

    [Benchmark]
    public async Task ImportWithService()
    {
        await using var stream = new MemoryStream(_csvData);
        await _service.ImportOrdersFromCsvAsync(stream, CancellationToken.None);
    }

    [Benchmark]
    public async Task ImportWithMediatR()
    {
        await using var stream = new MemoryStream(_csvData);
        await _mediator.Send(new ImportOrdersCommand(stream), CancellationToken.None);
    }

    [IterationCleanup]
    public void Cleanup()
    {
        using var conn = new NpgsqlConnection(connString);
        conn.Open();
        using var cmd = new NpgsqlCommand("TRUNCATE TABLE orders CASCADE;", conn);
        cmd.ExecuteNonQuery();
    }
}