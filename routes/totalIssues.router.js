const express = require("express");
const { supabase } = require("../libs/supabase");
const { db } = require("../config/constants/db");
const { redis } = require("../config/redis/redis");
const { env } = require("../config/constants/env");

const router = express.Router();
// const cache = new Map();
const TTL = env.TTL ? parseInt(env.TTL) : 15 * 60 * 1000;

router.get("/", async (req, res) => {
  const cacheKey = "TOTAL_ISSUES";
  let cachedData = null;
  try {
    cachedData = await redis.get(cacheKey);
  } catch (err) {
    console.warn("Redis error (get):", err.message);
  }
  if (cachedData != null) {
    console.log("Cache hit for total issues");
    console.log("Type of Data is :", typeof cachedData);

    // if (typeof cachedData === "object") {
    return res.status(200).json(cachedData);
    // }
    // return res.status(200).json(JSON.parse(cachedData));
  }
  try {
    const { data, error } = await supabase.from(db.issues).select("id");

    if (error) throw error;
    const totalIssues = data ? data.length : 0;
    console.log("Cache miss total issues fetcehed: ", totalIssues);
    if (totalIssues) {
      console.log("cache miss for total issues");
      const stringData = JSON.stringify(totalIssues);
      redis
        .set(cacheKey, stringData, {
          ex: TTL / 1000,
        })
        .catch((err) => console.warn("Redis error (set):", err.message));
      console.log("data set in cache for total issues:", totalIssues);
    }
    res.status(200).json({ totalIssues });
  } catch (error) {
    console.error("Error fetching total issues:", error);
    res.status(500).json({ error: "Failed to fetch total issues" });
  }
});

module.exports = router;
