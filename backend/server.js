import express from "express";
import cors from "cors";
import "./db.js"; // MongoDB connection

import requestRoute from "./routes/request.js";
import mechanicRoute from "./routes/mechanic.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/invoices", express.static("invoices"));
app.use(express.static("public")); // serve index.html, mechanic.html

// API routes
app.use("/api", requestRoute);
app.use("/api", mechanicRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
