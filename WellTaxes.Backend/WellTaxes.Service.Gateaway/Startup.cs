using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
using WellTaxes.Service.Gateaway.Data;
using WellTaxes.Service.Gateaway.Services;
using WellTaxes.Service.Gateway.Extensions;

namespace WellTaxes.Service.Gateaway
{
    public class Startup(IConfiguration configuration, IWebHostEnvironment environment)
    {
        public IConfiguration Configuration { get; } = configuration;
        public IWebHostEnvironment Environment { get; } = environment;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuth(Configuration);
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IOrderServiceClient, OrderServiceClient>();

            services.AddHttpContextAccessor();
            services.AddHttpClient();

            services.AddHttpClient("OrdersService", client =>
            {
                client.BaseAddress = new Uri(Configuration["Services:OrdersService:Url"]!);
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            services.AddMemoryCache();

            services.AddControllers();

            if (Environment.IsDevelopment() || Environment.IsStaging())
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "WellTaxes Gateway API",
                        Version = "v1",
                        Description = "Gateway API for managing users and orders with tax calculations"
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
                            Implicit = new OpenApiOAuthFlow
                            {
                                AuthorizationUrl = new Uri($"{Configuration["AzureAD:Instance"]}{Configuration["AzureAD:TenantId"]}/oauth2/v2.0/authorize"),
                                Scopes = new Dictionary<string, string> { { $"{Configuration["AzureAd:ClientId"]}/.default", "Access API" } }
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

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, ILogger<Startup> logger)
        {
            if (Environment.IsDevelopment())
                app.UseDeveloperExceptionPage();

            if (Environment.IsDevelopment() || Environment.IsStaging())
            {
                app.UseSwagger(p => p.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi2_0);

                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gateway API v1");
                    c.RoutePrefix = "swagger";
                    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                    if (Environment.IsDevelopment())
                        c.OAuthClientId(Configuration["AzureAD:ClientId"]);
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
