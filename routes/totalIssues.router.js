const express = require("express");
const { supabase } = require("../libs/supabase");
const { db } = require("../config/constants/db");
const { redis } = require("../config/redis/redis");
const { env } = require("../config/constants/env");

const router = express.Router();
// const cache = new Map();
const TTL = env.TTL ? parseInt(env.TTL) : 15 * 60 * 1000;

router.get("/", async (req, res) => {
  const repository = req.query.repository || "";

  const cacheKey =
    repository === "" ? "TOTAL_ISSUES_ALL" : `TOTAL_ISSUES_${repository}`;

  try {
    // console.log(cacheKey);
    const cachedData = await redis.get(cacheKey);
    console.log(cachedData);
    if (cachedData) {
      console.log("Cache hit:", cacheKey);
      return res.status(200).json(cachedData);
    }
  } catch (err) {
    console.warn("Redis error (get):", err.message);
  }
  console.log("Reponame", repository);
  try {
    let query = supabase.from(db.issues).select("id");

    if (repository !== "") {
      const { data: projectData, error: projectError } = await supabase
        .from(db.projects)
        .select("id")
        .eq("project_name", repository)
        .single();
      if (projectError) {
        if (projectError.code === "PGRST116") {
          return res.status(404).json({ error: "Repository not found" });
        }
        throw projectError;
      }
      // console.log(projectData.id);
      query = query.eq("project_id", projectData.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalIssues = data ? data.length : 0;
    // console.log(totalIssues);

    const response = { totalIssues };

    await redis.set(
      cacheKey,

      JSON.stringify(response),
      {
        ex: TTL / 1000,
      },
    );

    console.log("Cache miss. Stored:", cacheKey);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching total issues:", error);
    res.status(500).json({ error: "Failed to fetch total issues" });
  }
});

module.exports = router;
