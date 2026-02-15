const express = require("express");
const { supabase } = require("../libs/supabase");
const { db } = require("../config/constants/db");
const { redis } = require("../config/redis/redis");
const { env } = require("../config/constants/env");

const router = express.Router();
// const cache = new Map();
const TTL = env.TTL ? parseInt(env.TTL) : 15 * 60 * 1000;

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const from = (page - 1) * 9;
  // const to = page * 9 - 1;
  const to = from + 8;
  const cacheKey = `ISSUE_PAGE_${page}`;
  let cachedData = null;
  try {
    cachedData = await redis.get(cacheKey);
  } catch (err) {
    console.warn("Redis error (get):", err.message);
  }
  // console.log(cachedData);
  if (cachedData !== null) {
    console.log("Cache hit for issues page:", page);
    console.log("Type of Data for issues page is :", typeof cachedData);
    console.log("No of data sent from issue page:", cachedData.length);
    // console.log(cachedData);
    if (typeof cachedData === "object") {
      return res.status(200).json(cachedData);
    }
    return res.status(200).json(JSON.parse(cachedData));
  }
  try {
    // cache miss
    const { data, error } = await supabase
      .from(db.issues)
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    // if data is found add it to the cache with an expriry time of 15 mins
    if (data && data.length > 0) {
      console.log(
        "The data in cachec is moslty null/undedfined lets see: ",
        cachedData,
      );
      console.log("cache miss");
      const stringData = JSON.stringify(data);
      redis
        .set(cacheKey, stringData, {
          ex: TTL / 1000,
        })
        .catch((err) => console.warn("Redis error (set):", err.message));
      console.log("data set in cache:", data.length);
    }
    res.status(200).json(data || []);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

module.exports = router;
