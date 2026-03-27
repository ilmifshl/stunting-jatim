import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqxoloduboqmiymadomk.supabase.co';
const supabaseKey = 'sb_publishable_-En9cIb4wLp7HygfmxrRNw_Cnsx8Hit';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const year = 2023;
  console.log('Testing query for year:', year);
  
  // Try without the .eq filter first to see if regions exist
  const { data: allRegions, error: err1 } = await supabase
    .from('regions')
    .select('name')
    .limit(5);
  
  console.log('Sample regions:', allRegions?.map(r => r.name));

  // Now the failing query
  const { data, error } = await supabase
    .from('regions')
    .select(`
      name,
      stunting_data (
        prevalence,
        year
      )
    `)
    .eq('stunting_data.year', year);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Data count with year filter:', data?.length);
  if (data && data.length > 0) {
    const withData = data.filter(r => r.stunting_data && r.stunting_data.length > 0);
    console.log('Regions with stunting data:', withData.length);
    console.log('Sample region with data:', JSON.stringify(data.find(r => r.stunting_data.length > 0), null, 2));
  }
}

testQuery();
