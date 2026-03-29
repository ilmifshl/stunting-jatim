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

-- 3. Stunting Factors Table
CREATE TABLE stunting_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,

  -- 1. Faktor Risiko Langsung
  bblr_count INTEGER,
  bblr_rate FLOAT,
  imd_count INTEGER,
  imd_rate FLOAT,
  asi_count INTEGER,
  asi_rate FLOAT,

  -- 2. Faktor Pencegahan
  idl_count INTEGER,
  idl_rate FLOAT,
  vita_count INTEGER,
  vita_rate FLOAT,

  -- 3. Faktor Risiko Ibu
  ttd_count INTEGER,
  ttd_rate FLOAT,
  catin_count INTEGER,
  catin_rate FLOAT,

  -- 4. Faktor Lingkungan (Sanitasi)
  jamban_count INTEGER,
  jamban_rate FLOAT,
  stbm_count INTEGER,
  stbm_rate FLOAT,

  UNIQUE(region_id, year)
);

-- 3.1 Factor Scores View
CREATE VIEW vw_factor_scores AS
SELECT
  region_id,
  year,
  ROUND(((COALESCE(bblr_rate,0) + (100 - COALESCE(imd_rate,0)) + (100 - COALESCE(asi_rate,0))) / 3)::numeric, 2) AS skor_langsung,
  ROUND(((COALESCE(idl_rate,0) + COALESCE(vita_rate,0)) / 2)::numeric, 2) AS skor_pencegahan,
  ROUND(((COALESCE(ttd_rate,0) + COALESCE(catin_rate,0)) / 2)::numeric, 2) AS skor_ibu,
  ROUND(((COALESCE(jamban_rate,0) + COALESCE(stbm_rate,0)) / 2)::numeric, 2) AS skor_sanitasi
FROM stunting_factors;

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

-- Public read access for stunting_factors
ALTER TABLE stunting_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users - stunting_factors" ON stunting_factors FOR SELECT USING (true);
-- Note: Views do not support RLS directly if they are standard views, they inherit from underlying tables.

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

CREATE POLICY "Enable insert for authenticated users only" ON stunting_factors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON stunting_factors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON stunting_factors FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON articles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON articles FOR DELETE TO authenticated USING (true);
