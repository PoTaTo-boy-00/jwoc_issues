const { z } = require("zod");
require("dotenv").config();

const dbSchema = z.object({
  issues: z.string(),
});

const db = dbSchema.parse({
  issues: process.env.GITHUB_ISSUES,
});

module.exports = { db };
