using Microsoft.Identity.Web;

namespace WellTaxes.Service.Orders.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddAuth(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication().AddMicrosoftIdentityWebApi(configuration.GetSection("AzureAd"));
        }
    }
}
