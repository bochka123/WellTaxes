FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["WellTaxes.Service.Gateaway/WellTaxes.Service.Gateaway.csproj", "WellTaxes.Service.Gateaway/"]
RUN dotnet restore "WellTaxes.Service.Gateaway/WellTaxes.Service.Gateaway.csproj"

COPY WellTaxes.Service.Gateaway/ WellTaxes.Service.Gateaway/

WORKDIR "/src/WellTaxes.Service.Gateaway"
RUN dotnet publish "WellTaxes.Service.Gateaway.csproj" -c Release -o /app/publish /p:UseAppHost=false --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "WellTaxes.Service.Gateaway.dll"]