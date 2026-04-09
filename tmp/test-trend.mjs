import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data: bjn } = await supabase
    .from('stunting_data')
    .select('prevalence, year, regions!inner(name)')
    .or('name.eq."Bojonegoro",name.eq."Kabupaten Bojonegoro"', { referencedTable: 'regions' });
    
  console.log('Bojonegoro:', JSON.stringify(bjn, null, 2));

  const { data: blt } = await supabase
    .from('stunting_data')
    .select('prevalence, year, regions!inner(name)')
    .or('name.eq."Blitar",name.eq."Kabupaten Blitar"', { referencedTable: 'regions' });
    
  console.log('Blitar:', JSON.stringify(blt, null, 2));
}

testFetch();
