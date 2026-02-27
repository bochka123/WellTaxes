using Microsoft.OpenApi.Models;
using Npgsql;
using System.Reflection;
using WellTaxes.Service.Core.Queries;
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
                var connStr = config.GetConnectionString("DefaultConnection");
                return new NpgsqlConnection(connStr);
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.SetIsOriginAllowed(origin => true)
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });

            services.AddAuth(Configuration);
            services.AddScoped<IOrderService, OrderService>();

            services.AddHttpContextAccessor();
            services.AddHttpClient();
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssemblies(typeof(GetJurisdictionsQuery).Assembly);
            });

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
                        Implicit = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri($"{Configuration["AzureAd:Instance"]}{Configuration["AzureAd:TenantId"]}/oauth2/v2.0/authorize"),
                            Scopes = new Dictionary<string, string> { { $"{Configuration["AzureAd:Scopes"]}", "Default" } }
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

                    if (Environment.IsDevelopment())
                        c.OAuthClientId(Configuration["Swagger:ClientId"]);
                });
            }

            app.UseHttpsRedirection();

            app.UseRouting();
            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
