const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: systems } = await supabase.from('ai_systems').select('*').ilike('name', '%EdPuzzle%').order('created_at', { ascending: false }).limit(1);
  if (!systems || systems.length === 0) {
    console.log("EdPuzzle not found");
    return;
  }
  const sysId = systems[0].id;
  console.log("Checking system:", systems[0].name, sysId);
  
  const { data: evals } = await supabase.from('evaluations').select('*').eq('ai_system_id', sysId).order('created_at', { ascending: false }).limit(1);
  if (evals.length > 0) {
    const evalId = evals[0].id;
    console.log("Eval ID:", evalId);
    
    const { data: crawls } = await supabase.from('crawl_results').select('url, crawl_type').eq('evaluation_id', evalId);
    console.log("Crawls count:", crawls.length);
    console.log("Crawl types:", crawls.map(c => c.crawl_type));
    
    const { data: evidences } = await supabase.from('ai_evidences').select('*').eq('evaluation_id', evalId);
    console.log("Evidences found:", evidences.length);
    console.log("Parameter keys:", evidences.map(e => e.parameter_key));
  }
}
check();
