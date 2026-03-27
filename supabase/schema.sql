-- Enable PostGIS for geospatial data if not enabled
-- create extension if not exists postgis;

-- 1. Regions Table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  geojson JSONB NOT NULL
);

-- 2. Stunting Data Table
CREATE TABLE stunting_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  stunting_cases INTEGER NOT NULL,
  prevalence FLOAT NOT NULL,
  UNIQUE(region_id, year)
);

-- 3. Risk Factors Table
CREATE TABLE risk_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  sanitation FLOAT NOT NULL,        -- Percentage/Index
  clean_water FLOAT NOT NULL,       -- Percentage/Index
  mother_education FLOAT NOT NULL,  -- Percentage/Index or Avg Years
  nutrition_status FLOAT NOT NULL,  -- Index
  UNIQUE(region_id, year)
);

-- 4. Articles Table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Set up Row Level Security (RLS)

-- Public read access for regions
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users - regions" ON regions FOR SELECT USING (true);

-- Public read access for stunting_data
ALTER TABLE stunting_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users - stunting_data" ON stunting_data FOR SELECT USING (true);

-- Public read access for risk_factors
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users - risk_factors" ON risk_factors FOR SELECT USING (true);

-- Public read access for articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users - articles" ON articles FOR SELECT USING (true);

-- Admin write access policies (assuming admins have a specific role or authentication status)
-- For simplicity, since Next.js server actions/API routes using service_role key bypass RLS, we can rely on that,
-- but if using client side, we should add policies requiring authenticated session with 'admin' role.

CREATE POLICY "Enable insert for authenticated users only" ON regions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON regions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON regions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON stunting_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON stunting_data FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON stunting_data FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON risk_factors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON risk_factors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON risk_factors FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON articles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON articles FOR DELETE TO authenticated USING (true);
