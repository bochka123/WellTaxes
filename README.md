# WellTaxes

WellTaxes is a property-tax calculation platform for New York State.
Users can select a parcel on an interactive map, enter a sale price, and receive a detailed breakdown of applicable state, county, city, and special district taxes based on ZIP jurisdiction.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Important: Use the `localhost` Branch for Local Development](#important-use-the-localhost-branch-for-local-development)
* [Prerequisites](#prerequisites)

  * [Install Docker Desktop (Windows/macOS)](#install-docker-desktop-windowsmacos)
  * [Install Docker on Linux](#install-docker-on-linux)
  * [Verify Installation](#verify-installation)
* [Project Structure](#project-structure)
* [First-Time Setup](#first-time-setup)
* [Access URLs](#access-urls)
* [Test User Credentials](#test-user-credentials)
* [Production Deployment](#production-deployment)
* [How to Stop Containers](#how-to-stop-containers)
* [How to Fully Reset Docker Environment](#how-to-fully-reset-docker-environment)
* [Services Overview](#services-overview)

---

## Project Overview

WellTaxes enables users to:

1. Select a parcel on an interactive New York State map.
2. Enter a property sale price.
3. Calculate tax breakdowns including:

   * State taxes
   * County taxes
   * City taxes
   * Special district taxes
4. View a structured tax summary based on ZIP jurisdiction rules.

The entire system runs using Docker containers. No manual installation of .NET, Node.js, or PostgreSQL is required.

---

## Important: Use the `localhost` Branch for Local Development

Before pulling or cloning the project for local execution, make sure you use the `localhost` branch.

### If cloning for the first time:

```bash
git clone -b localhost <repository-url>
cd WellTaxes
```

### If you already cloned the repository:

```bash
cd WellTaxes
git fetch
git checkout localhost
git pull
```

The `localhost` branch contains the correct Docker configuration and environment settings required for local execution.

---

## Prerequisites

You only need Docker installed on your system.

---

### Install Docker Desktop (Windows/macOS)

1. Go to:
   [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download Docker Desktop for your operating system.
3. Run the installer.
4. Restart your computer if prompted.
5. Launch Docker Desktop and wait until it shows that Docker is running.

---

### Install Docker on Linux

For Ubuntu:

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

Add your user to the Docker group (optional but recommended):

```bash
sudo usermod -aG docker $USER
```

Log out and log back in after running this command.

---

### Verify Installation

Run:

```bash
docker --version
docker compose version
```

If both commands return version numbers, Docker is installed correctly.

---

## Project Structure

Example structure of the `WellTaxes` root folder:

```
WellTaxes/
│
├── docker-compose.yml
├── README.md
│
├── WellTaxes.Backend/
│   ├── Dockerfile
│   └── (ASP.NET Core API source)
│
├── WellTaxes.Frontend/
│   ├── Dockerfile
│   └── (React / Web UI source)
│
└── init-db/
    └── (PostgreSQL configuration, migrations, seeds)
```

---

## First-Time Setup

Follow these steps carefully.

### 1. Navigate to the Project Root

Open a terminal and go to the root folder:

```bash
cd path/to/WellTaxes
```

Make sure you are inside the folder that contains `docker-compose.yml`.

---

### 2. Stop and Remove Existing Containers (Clean Start)

```bash
docker compose down -v
```

This removes:

* All containers
* Networks
* Volumes (including database data)

---

### 3. Build Containers (No Cache)

```bash
docker compose build --no-cache
```

This ensures a clean rebuild of:

* Backend API
* Frontend application
* Database service

---

### 4. Start the Application

```bash
docker compose up
```

Wait until all services are fully started.

You should see logs indicating:

* Database is ready
* Backend is running
* Frontend is running

---

## Access URLs

After startup, access the application in your browser:

Frontend:

```
http://localhost:3000/
```

Backend API:

```
http://localhost:8080/
```

---

## Test User Credentials

Use the following credentials to log in:

**Email:**

```
welltaxes@hopiemplegmail.onmicrosoft.com
```

**Password:**

```
Dora198605QQ
```

---

## Production Deployment

Live production environment:

```
https://welltaxes.online
```

---

## How to Stop Containers

To stop all running services:

```bash
docker compose down
```

---

## How to Fully Reset Docker Environment

To completely reset the project:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```

If you need to remove unused Docker resources globally:

```bash
docker system prune -a --volumes
```

Use this command with caution. It removes all unused containers, images, and volumes on your machine.

---

## Services Overview

### Frontend

* Interactive map interface
* Parcel selection
* Sale price input
* Tax breakdown display
* Runs on port 3000

### Backend API

* Tax calculation engine
* Jurisdiction-based logic
* ZIP-based tax resolution
* Authentication support
* Runs on port 8080

### Database

* PostgreSQL
* Stores tax zones and jurisdiction data
* Stores application user data
* Runs inside Docker container

---

## Summary

WellTaxes is fully containerized and designed for simple local execution using Docker.
Follow the setup steps exactly as described, and the platform will run locally without installing any additional development tools.
