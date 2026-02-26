-- =========================================
-- Таблиця: jurisdictions
-- =========================================
CREATE TABLE jurisdictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    zipcode VARCHAR(10) NOT NULL,
    geom GEOMETRY(MULTIPOLYGON, 4269) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Унікальний індекс на ZIP для швидкого пошуку
CREATE UNIQUE INDEX idx_jurisdictions_zipcode ON jurisdictions(zipcode);

-- Просторовий GIST-індекс для геометрії
CREATE INDEX idx_jurisdictions_geom_gist ON jurisdictions USING GIST(geom);

-- =========================================
-- Таблиця: orders
-- =========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL,
    user_id UUID NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
    amount_with_tax NUMERIC(18,2) NOT NULL CHECK (amount_with_tax >= 0),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Унікальний індекс на номер замовлення
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number);

-- Індекс на користувача для швидкого вибору його замовлень
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- =========================================
-- Таблиця: tax_rates
-- =========================================
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state TEXT NOT NULL,
    zipcode VARCHAR(10) NOT NULL,
    tax_region_name TEXT NOT NULL,
    total_rate NUMERIC(5,3) NOT NULL CHECK (total_rate >= 0 AND total_rate <= 1),
    state_rate NUMERIC(5,3) NOT NULL CHECK (state_rate >= 0 AND state_rate <= 1),
    estimated_county_rate NUMERIC(5,3) NOT NULL CHECK (estimated_county_rate >= 0 AND estimated_county_rate <= 1),
    estimated_city_rate NUMERIC(5,3) NOT NULL CHECK (estimated_city_rate >= 0 AND estimated_city_rate <= 1),
    estimated_special_rate NUMERIC(5,3) NOT NULL CHECK (estimated_special_rate >= 0 AND estimated_special_rate <= 1),
    jurisdiction_id UUID REFERENCES jurisdictions(id),
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Унікальний ключ для уникнення дублікатів по ZIP + період
CREATE UNIQUE INDEX idx_taxrates_zip_period ON tax_rates(zipcode, valid_from, valid_to);

-- Індекс на ZIP для швидких запитів
CREATE INDEX idx_taxrates_zipcode ON tax_rates(zipcode);