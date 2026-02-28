-- Створення розширень
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Таблиці
CREATE TABLE public.jurisdictions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    zipcode character varying(10) NOT NULL,
    geom public.geometry(MultiPolygon,4269) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT jurisdictions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number text NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(18,2) NOT NULL,
    amount_with_tax numeric(18,2) NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    tax_rates_id uuid,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_amount_check CHECK (amount >= 0),
    CONSTRAINT orders_amount_with_tax_check CHECK (amount_with_tax >= 0)
);

CREATE TABLE public.tax_rates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    state text NOT NULL,
    zipcode character varying(10) NOT NULL,
    tax_region_name text NOT NULL,
    total_rate numeric(5,3) NOT NULL CHECK (total_rate >= 0 AND total_rate <= 1),
    state_rate numeric(5,3) NOT NULL CHECK (state_rate >= 0 AND state_rate <= 1),
    estimated_county_rate numeric(5,3) NOT NULL CHECK (estimated_county_rate >= 0 AND estimated_county_rate <= 1),
    estimated_city_rate numeric(5,3) NOT NULL CHECK (estimated_city_rate >= 0 AND estimated_city_rate <= 1),
    estimated_special_rate numeric(5,3) NOT NULL CHECK (estimated_special_rate >= 0 AND estimated_special_rate <= 1),
    jurisdiction_id uuid,
    valid_from timestamp without time zone NOT NULL,
    valid_to timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT tax_rates_pkey PRIMARY KEY (id),
    CONSTRAINT tax_rates_jurisdiction_id_fkey FOREIGN KEY (jurisdiction_id) REFERENCES public.jurisdictions(id)
);

-- Індекси
CREATE UNIQUE INDEX idx_jurisdictions_zipcode ON public.jurisdictions USING btree (zipcode);
CREATE INDEX idx_jurisdictions_geom_gist ON public.jurisdictions USING gist (geom);

CREATE UNIQUE INDEX idx_orders_order_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_tax_rates_id ON public.orders USING btree (tax_rates_id);

CREATE UNIQUE INDEX idx_taxrates_zip_period ON public.tax_rates USING btree (zipcode, valid_from, valid_to);
CREATE INDEX idx_taxrates_zipcode ON public.tax_rates USING btree (zipcode);

-- FK для orders
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_tax_rates FOREIGN KEY (tax_rates_id) REFERENCES public.tax_rates(id);