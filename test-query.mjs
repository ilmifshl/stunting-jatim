import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://uqxoloduboqmiymadomk.supabase.co';
const supabaseKey = 'sb_publishable_-En9cIb4wLp7HygfmxrRNw_Cnsx8Hit';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data: currData } = await supabase.from('stunting_data').select('prevalence, regions:regions(name)').eq('year', 2024);
  const { data: prevData } = await supabase.from('stunting_data').select('prevalence, regions:regions(name)').eq('year', 2023);

  const result = {
    bojonegoro_2024: currData?.find(d => d.regions?.name === 'Kabupaten Bojonegoro' || d.regions?.name === 'Bojonegoro'),
    bojonegoro_2023: prevData?.find(d => d.regions?.name === 'Kabupaten Bojonegoro' || d.regions?.name === 'Bojonegoro'),
    blitar_kab_2024: currData?.find(d => d.regions?.name === 'Kabupaten Blitar'),
    blitar_kab_2023: prevData?.find(d => d.regions?.name === 'Kabupaten Blitar'),
    blitar_kota_2024: currData?.find(d => d.regions?.name === 'Kota Blitar'),
    blitar_kota_2023: prevData?.find(d => d.regions?.name === 'Kota Blitar'),
  };

  fs.writeFileSync('tmp/test-output.json', JSON.stringify(result, null, 2));
}

testQuery();
