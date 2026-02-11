const { createClient } = require("@supabase/supabase-js");
const { env } = require("../config/constants/env");
require("dotenv").config();

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = { supabase };
