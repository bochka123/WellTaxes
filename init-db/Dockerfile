FROM mcr.microsoft.com/dotnet/runtime:10.0 AS base
WORKDIR /app

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["init-db.csproj", "."]
RUN dotnet restore "./init-db.csproj"
COPY . .
RUN dotnet build "./init-db.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./init-db.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app

RUN apt-get update \
    && apt-get install -y libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
# Копіюємо SQL файл
COPY init.sql .
COPY Data/ ./Data/
ENTRYPOINT ["dotnet", "init-db.dll"]