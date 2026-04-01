
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkGeoJSONSize() {
  console.log('Checking GeoJSON sizes in regions table...');
  const { data, error } = await supabase.from('regions').select('name, geojson');
  
  if (error) {
    console.error('Error fetching regions:', error);
    return;
  }

  let totalBytes = 0;
  data.forEach(region => {
    const size = JSON.stringify(region.geojson).length;
    console.log(`${region.name}: ${(size / 1024).toFixed(2)} KB`);
    totalBytes += size;
  });

  console.log('-------------------');
  console.log(`Total Regions: ${data.length}`);
  console.log(`Total Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

checkGeoJSONSize();
