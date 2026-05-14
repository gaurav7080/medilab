const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('YOUR_PROJECT_ID')) {
    console.error('❌ Supabase credentials not configured! Update .env with your Supabase project URL and service key.');
    console.error('   Get them from: https://supabase.com/dashboard → Project Settings → API');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
