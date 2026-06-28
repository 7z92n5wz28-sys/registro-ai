const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clean() {
  console.log("Cleaning database...");
  
  // Delete evaluations first (this will cascade to ai_evidences and crawl_results)
  const { error: errEvals } = await supabase.from('evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errEvals) {
    console.error("Error deleting evaluations:", errEvals);
  } else {
    console.log("Evaluations deleted.");
  }
  
  // Delete ai_systems
  const { error: errSystems } = await supabase.from('ai_systems').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errSystems) {
    console.error("Error deleting ai_systems:", errSystems);
  } else {
    console.log("AI Systems deleted.");
  }
  
  console.log("Database clean complete.");
}
clean();
