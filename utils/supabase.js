
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const { DB_URL, DB_KEY } = process.env;

module.exports = createClient(DB_URL, DB_KEY)