using WellTaxes.Service.Core.Interfaces;

namespace WellTaxes.Service.Orders.HostedServices
{
    public class JurisdictionsCachingHostedService(ServiceProvider serviceProvider, Timer timer, ILogger<JurisdictionsCachingHostedService> logger) : IHostedService, IDisposable
    {

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(UpdateCache, null, TimeSpan.FromMinutes(0), TimeSpan.FromMinutes(10));
            return Task.CompletedTask;
        }

        private void UpdateCache(object state)
        {
            try
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var jurisdictionsService = scope.ServiceProvider.GetService<IJurisdictionsService>();
                    var _ = jurisdictionsService?.GetAllJurisdictionsAsync().Result;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
            }

            logger.LogInformation("JurisdictionsCachingHostedService Timed Hosted Service is working");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}
