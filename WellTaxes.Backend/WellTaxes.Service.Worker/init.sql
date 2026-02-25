-- PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- таблиці юрисдикцій
CREATE TABLE jurisdiction (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    fips_code VARCHAR(10),
    state_code VARCHAR(2)
);

-- temporal boundaries
CREATE TABLE jurisdiction_boundary (
    id SERIAL PRIMARY KEY,
    jurisdiction_id INT NOT NULL REFERENCES jurisdiction(id),
    valid_from timestamptz NOT NULL,
    valid_to timestamptz NOT NULL,
    geom geometry(MULTIPOLYGON, 4326) NOT NULL,
    CONSTRAINT no_overlap EXCLUDE USING gist (
        jurisdiction_id WITH =,
        tstzrange(valid_from, valid_to) WITH &&
    )
);

-- ставки податків
CREATE TABLE tax_rate (
    id SERIAL PRIMARY KEY,
    jurisdiction_id INT NOT NULL REFERENCES jurisdiction(id),
    tax_type VARCHAR(20) NOT NULL,
    rate NUMERIC(6,5) NOT NULL,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz NOT NULL
);

-- runtime table
CREATE TABLE effective_tax_area (
    id SERIAL PRIMARY KEY,
    geom geometry(MULTIPOLYGON, 4326) NOT NULL,
    composite_rate NUMERIC(6,5) NOT NULL,
    jurisdiction_ids INT[] NOT NULL,
    valid_from timestamptz NOT NULL,
    valid_to timestamptz NOT NULL
);

-- GIST indexes
CREATE INDEX idx_jurisdiction_boundary_geom ON jurisdiction_boundary USING GIST (geom);
CREATE INDEX idx_effective_tax_area_geom ON effective_tax_area USING GIST (geom);