using Microsoft.OpenApi.Models;
using Npgsql;
using System.Reflection;
using WellTaxes.Service.Orders.Extensions;
using WellTaxes.Service.Orders.Services;

namespace WellTaxes.Service.Orders
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddTransient(sp =>
            {
                var config = sp.GetRequiredService<IConfiguration>();
                var connStr = config["DefaultConnectionString"];
                return new NpgsqlConnection(connStr);
            });

            services.AddAuth(Configuration);
            services.AddScoped<IOrderService, OrderService>();

            services.AddHttpContextAccessor();
            services.AddHttpClient();

            services.AddMemoryCache();

            services.AddControllers();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "WellTaxes Orders API",
                    Version = "v1",
                    Description = "Orders API for managing users and orders with tax calculations"
                });

                c.CustomSchemaIds(type => type.FullName);
                c.CustomOperationIds(e => $"{e.ActionDescriptor.RouteValues["controller"]}_{e.ActionDescriptor.RouteValues["action"]}_gateway");
                c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.OAuth2,
                    In = ParameterLocation.Header,
                    Scheme = "Bearer",
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri($"https://login.microsoftonline.com/{Configuration["AzureAd:TenantId"]}/oauth2/v2.0/authorize"),
                            TokenUrl = new Uri($"https://login.microsoftonline.com/{Configuration["AzureAd:TenantId"]}/oauth2/v2.0/token"),
                            Scopes = new Dictionary<string, string>
                            {
                                { $"{Configuration["AzureAd:Audience"]}/access", "Access API" }
                            }
                        }
                    }
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "oauth2"
                            }
                        },
                        new string[] {}
                    }
                });
                c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml"));
            });
        }

        public void Configure(IApplicationBuilder app, ILogger<Startup> logger)
        {
            if (Environment.IsDevelopment())
                app.UseDeveloperExceptionPage();

            if (Environment.IsDevelopment() || Environment.IsStaging())
            {
                app.UseSwagger(p => p.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi2_0);

                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Orders API v1");
                    c.RoutePrefix = "swagger";
                    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                });
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
