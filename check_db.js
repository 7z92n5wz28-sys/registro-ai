const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: systems, error: sysErr } = await supabase.from('ai_systems').select('*').order('created_at', { ascending: false }).limit(1);
  if (sysErr) {
    console.error("Sys err", sysErr);
    return;
  }
  if (!systems || systems.length === 0) {
    console.log("No systems found");
    return;
  }
  const sysId = systems[0].id;
  console.log("Checking system:", systems[0].name, sysId);
  
  const { data: evals } = await supabase.from('evaluations').select('*').eq('ai_system_id', sysId).order('created_at', { ascending: false }).limit(1);
  if (evals && evals.length > 0) {
    const evalId = evals[0].id;
    console.log("Eval ID:", evalId);
    
    const { data: evidences } = await supabase.from('ai_evidences').select('*').eq('evaluation_id', evalId);
    console.log("Evidences found:", evidences.length);
    console.log(JSON.stringify(evidences, null, 2));
  } else {
    console.log("No evaluations found");
  }
}
check();
