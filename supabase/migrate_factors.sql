-- Migrasi dari risk_factors ke stunting_factors

-- 1. Hapus tabel lama beserta policy-nya (hapus jika sudah yakin/backup data lama jika diperlukan)
DROP TABLE IF EXISTS risk_factors CASCADE;

-- 2. Buat tabel baru stunting_factors
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

-- 3. Buat view untuk composite scores (akan ditarik oleh K-Medoids / chart frontend)
CREATE OR REPLACE VIEW vw_factor_scores AS
SELECT
  region_id,
  year,
  ROUND(((COALESCE(bblr_rate,0) + (100 - COALESCE(imd_rate,0)) + (100 - COALESCE(asi_rate,0))) / 3)::numeric, 2) AS skor_langsung,
  ROUND(((COALESCE(idl_rate,0) + COALESCE(vita_rate,0)) / 2)::numeric, 2) AS skor_pencegahan,
  ROUND(((COALESCE(ttd_rate,0) + COALESCE(catin_rate,0)) / 2)::numeric, 2) AS skor_ibu,
  ROUND(((COALESCE(jamban_rate,0) + COALESCE(stbm_rate,0)) / 2)::numeric, 2) AS skor_sanitasi
FROM stunting_factors;

-- 4. Atur RLS Policies
ALTER TABLE stunting_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users - stunting_factors" ON stunting_factors FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON stunting_factors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON stunting_factors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON stunting_factors FOR DELETE TO authenticated USING (true);
