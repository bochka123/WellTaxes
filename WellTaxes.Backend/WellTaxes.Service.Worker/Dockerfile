FROM mcr.microsoft.com/dotnet/runtime:10.0 AS base
USER $APP_UID
WORKDIR /app


FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["WellTaxes.Service.Worker/WellTaxes.Service.Worker.csproj", "WellTaxes.Service.Worker/"]
RUN dotnet restore "./WellTaxes.Service.Worker/WellTaxes.Service.Worker.csproj"
COPY . .
WORKDIR "/src/WellTaxes.Service.Worker"
RUN dotnet build "./WellTaxes.Service.Worker.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./WellTaxes.Service.Worker.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WellTaxes.Service.Worker.dll"]