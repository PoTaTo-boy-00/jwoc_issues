const { z } = require("zod");
require("dotenv").config();

const dbSchema = z.object({
  issues: z.string(),
  projects: z.string().optional(),
});

const db = dbSchema.parse({
  issues: process.env.GITHUB_ISSUES,
  projects: process.env.JWOC_PROJECTS,
});

module.exports = { db };
