import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqxoloduboqmiymadomk.supabase.co';
const supabaseKey = 'sb_publishable_-En9cIb4wLp7HygfmxrRNw_Cnsx8Hit';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findYears() {
  const { data, error } = await supabase
    .from('stunting_data')
    .select('year')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  const years = [...new Set(data.map(d => d.year))];
  console.log('Available years:', years);
  console.log('Latest year:', years[0]);
}

findYears();
