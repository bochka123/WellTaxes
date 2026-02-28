# WellTaxes

A property-tax calculation platform for New York State. Users select a parcel on an interactive map, submit a sale price, and receive a breakdown of state / county / city / special tax rates for the matching ZIP jurisdiction.

---

## Table of Contents

- [WellTaxes](#welltaxes)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Repository Structure](#repository-structure)
  - [Database Setup](#database-setup)
    - [1. Create the database and enable extensions](#1-create-the-database-and-enable-extensions)
    - [2. Run the schema script](#2-run-the-schema-script)
    - [3. Seed tax-rate data](#3-seed-tax-rate-data)
  - [Backend Setup](#backend-setup)
    - [Azure AD — app registration](#azure-ad--app-registration)
    - [User Secrets — Orders service](#user-secrets--orders-service)
  - [Frontend Setup](#frontend-setup)
    - [1. Install dependencies](#1-install-dependencies)
    - [2. Create `.env.local`](#2-create-envlocal)
  - [Running Everything](#running-everything)
  - [Docker Build (Frontend)](#docker-build-frontend)

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8 |
| [Node.js](https://nodejs.org/) | 22 |
| [PostgreSQL](https://www.postgresql.org/) + [PostGIS](https://postgis.net/) | PG 15 / PostGIS 3 |
| [psql](https://www.postgresql.org/docs/current/app-psql.html) CLI | any |

> **PostGIS** is required — the jurisdictions table stores `GEOMETRY(MULTIPOLYGON, 4269)` and tax lookup uses spatial queries.

---

## Repository Structure

```
WellTaxes/
├── WellTaxes.Frontend/          # React + Vite SPA
└── WellTaxes.Backend/
    ├── WellTaxes.Service.Core/      # Shared entities, interfaces, services
    ├── WellTaxes.Service.Orders/    # Main REST API  (port 7116 / 5005)
    └── WellTaxes.Service.Worker/    # Background worker + DB init SQL
```

---

## Database Setup

### 1. Create the database and enable extensions

```sql
CREATE DATABASE welltaxes;
\c welltaxes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Run the schema script

```bash
psql -U postgres -d welltaxes -f WellTaxes.Backend/WellTaxes.Service.Worker/init.sql
```

This creates three tables: `jurisdictions`, `tax_rates`, and `orders`.

### 3. Seed tax-rate data

Import your NY tax-rate CSV (one row per ZIP code) into the `tax_rates` table:

```bash
psql -U postgres -d welltaxes -c "\copy tax_rates(state, zipcode, tax_region_name, total_rate, state_rate, estimated_county_rate, estimated_city_rate, estimated_special_rate, valid_from) FROM 'path/to/tax_rates.csv' CSV HEADER"
```

Seed jurisdiction polygons (NY GeoJSON / Shapefile → PostGIS):

```bash
# example using shp2pgsql if you have a Shapefile
shp2pgsql -s 4269 ny_jurisdictions.shp public.jurisdictions | psql -U postgres -d welltaxes
```

---

## Backend Setup

### Azure AD — app registration

Both the API and the frontend share **one** Azure AD app registration.

1. Go to **Azure Portal → App registrations → New registration**
2. Set a **Redirect URI** of type *Single-page application*: `http://localhost:5173`
3. Under **Expose an API**, add a scope (e.g. `access`) and note the full scope URI:  
   `api://<CLIENT_ID>/access`
4. Note your **Client ID** and **Tenant ID**

### User Secrets — Orders service

The Orders API reads secrets via `dotnet user-secrets`. Run from inside `WellTaxes.Service.Orders/`:

```bash
cd WellTaxes.Backend/WellTaxes.Service.Orders

dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=welltaxes;Username=postgres;Password=YOUR_PG_PASSWORD"

dotnet user-secrets set "AzureAd:ClientId"  "<YOUR_CLIENT_ID>"
dotnet user-secrets set "AzureAd:TenantId"  "<YOUR_TENANT_ID>"
dotnet user-secrets set "AzureAd:Scopes"    "access"
```

Verify secrets are stored:

```bash
dotnet user-secrets list
```

---

## Frontend Setup

### 1. Install dependencies

```bash
cd WellTaxes.Frontend
npm install
```

### 2. Create `.env.local`

Create `WellTaxes.Frontend/.env.local` (this file is git-ignored):

```env
# URL of the backend Orders API
VITE_API_URL=https://localhost:7116
```

The MSAL configuration (Client ID, Tenant ID, scopes) is already hardcoded in  
`src/shared/config/msal.ts`. Update that file if you use a different app registration.

---

## Running Everything

Open three terminals from the repository root:

**Terminal 1 — Orders API**
```bash
cd WellTaxes.Backend/WellTaxes.Service.Orders
dotnet run
# Listening on https://localhost:7116
```

**Terminal 2 — Frontend**
```bash
cd WellTaxes.Frontend
npm run dev
# http://localhost:5173
```

Open **http://localhost:5173** — sign in with your Microsoft / Azure AD account.

---

## Docker Build (Frontend)

```bash
docker build \
  --build-arg VITE_API_URL=https://your-api-domain.com \
  -t welltaxes-frontend \
  WellTaxes.Frontend

docker run -p 80:80 welltaxes-frontend
```

`VITE_API_URL` is baked in at build time by Vite — pass the production API URL as a build argument.
