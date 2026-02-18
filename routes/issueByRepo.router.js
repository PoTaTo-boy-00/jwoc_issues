const express = require("express");
const { supabase } = require("../libs/supabase");
const { db } = require("../config/constants/db");
const { redis } = require("../config/redis/redis");
const { env } = require("../config/constants/env");

const router = express.Router();
// const cache = new Map();
const TTL = env.TTL ? env.TTL : 15 * 60 * 1000;

router.get("/:repo", async (req, res) => {
  const repoName = req.params.repo;
  const page = parseInt(req.query.page) || 1;
  const from = (page - 1) * 9;
  // const to = page * 9 - 1;
  const to = from + 8;
  const cacheKey = `ISSUES_BY_REPO_${repoName}_PAGE_${page}`;
  let cachedData = null;
  //   console.log(repoName);
  try {
    cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("cache hit for repo ", repoName);
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
      });
    }
    const { data, error } = await supabase
      .from(db.projects)
      .select("id")
      .eq("project_name", repoName);

    const projectId = data && data.length > 0 ? data[0].id : null;

    if (!projectId) {
      return res.status(404).json({
        success: false,
        error: "Repository not found",
      });
    }
    const { data: issuesData, error: issuesError } = await supabase
      .from(db.issues)
      .select("*")
      .eq("project_id", projectId)
      .range(from, to);

    if (issuesError) {
      throw issuesError;
    }

    await redis.setex(cacheKey, TTL / 1000, JSON.stringify(issuesData));

    res.status(200).json({
      success: true,
      data: issuesData,
      fromCache: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
