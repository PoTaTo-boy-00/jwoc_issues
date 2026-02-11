//imports
const express = require("express");
const cors = require("cors");
const issueRouter = require("./routes/issues.router");
const { ratelimiterMiddlware } = require("./middleware/rateLimitMIddleware");
// const { env } = require("./config/constants/env");
require("dotenv").config();

// init
const app = express();
const PORT = 5000;

//middleware
app.use(
  cors({
    origin: "http://localhost:5173" || "https://www.jwoc.in/issues",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET"],
    credentials: true,
  }),
);
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/issues", ratelimiterMiddlware, issueRouter);

//start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
