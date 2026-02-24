using Microsoft.Identity.Web;
using WellTaxes.Service.Gateway.Models;

namespace WellTaxes.Service.Gateway.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddAuth(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication().AddMicrosoftIdentityWebApi(configuration.GetSection(GatewayConstants.AzureAdSection));
        }
    }
}
