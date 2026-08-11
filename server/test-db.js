require('dotenv').config();
const supabase = require('./config/db');
async function test() {
    console.log("Checking DB Connection...");
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error("DB Error:", error);
    } else {
        console.log("Users found:", data ? data.length : 0);
        if (data && data.length > 0) {
            console.log("First user email:", data[0].email);
        }
    }
}
test();
