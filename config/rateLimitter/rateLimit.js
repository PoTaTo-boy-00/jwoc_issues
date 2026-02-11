const { Ratelimit } = require("@upstash/ratelimit");
const { redis } = require("../redis/redis");

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

module.exports = { ratelimit };
