FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["WellTaxes.Service.Orders/WellTaxes.Service.Orders.csproj", "WellTaxes.Service.Orders/"]
RUN dotnet restore "WellTaxes.Service.Orders/WellTaxes.Service.Orders.csproj"

COPY . .
WORKDIR "/src/WellTaxes.Service.Orders"
RUN dotnet publish "WellTaxes.Service.Orders.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "WellTaxes.Service.Orders.dll"]