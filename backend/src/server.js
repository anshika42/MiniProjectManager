require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const requireAuth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");

const app = express();
const port = process.env.PORT || 4000;

if (!process.env.MONGODB_URI ) {
  throw new Error("MONGODB_URI must be set in backend/.env.");
}
if(!process.env.JWT_SECRET){
  throw new Error("JWT_SECRET must be set in backend/.env.");}
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", requireAuth, projectRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 11000) {
    return res
      .status(409)
      .json({ message: "An account with this email already exists." });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () =>
      console.log(`API running at http://localhost:${port}`),
    );
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error);
    process.exit(1);
  });
