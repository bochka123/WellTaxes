FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY WellTaxes.Service.Orders/WellTaxes.Service.Orders.csproj WellTaxes.Service.Orders/
COPY WellTaxes.Service.Core/WellTaxes.Service.Core.csproj WellTaxes.Service.Core/

RUN dotnet restore WellTaxes.Service.Orders/WellTaxes.Service.Orders.csproj

COPY WellTaxes.Service.Orders/ WellTaxes.Service.Orders/
COPY WellTaxes.Service.Core/ WellTaxes.Service.Core/

COPY WellTaxes.Service.Orders/appsettings.Development.json WellTaxes.Service.Orders/

WORKDIR /src/WellTaxes.Service.Orders
RUN dotnet publish "WellTaxes.Service.Orders.csproj" -c Release -o /app/publish /p:UseAppHost=false --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV DOTNET_ENVIRONMENT=Development

EXPOSE 8080
ENTRYPOINT ["dotnet", "WellTaxes.Service.Orders.dll"]