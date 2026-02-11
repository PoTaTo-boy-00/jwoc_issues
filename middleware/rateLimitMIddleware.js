const { ratelimit } = require("../config/rateLimitter/rateLimit");

const ratelimiterMiddlware = async (req, res, next) => {
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);
  if (!success) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  }
  next();
};

module.exports = { ratelimiterMiddlware };
