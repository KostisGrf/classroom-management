
import AgentAPI from "apminsight";
AgentAPI.config()

import express from "express";
import subjectsRouter from "./routes/subjects.js";
import cors from 'cors';
import departmentsRouter from "./routes/departments.js";
import securityMiddleware from "./middleware/security.js";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import { Agent } from "node:http";

const app = express();
const PORT = 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

// middleware
app.use(express.json());

app.use(securityMiddleware)

app.use('/api/subjects',subjectsRouter);
app.use('/api/departments',departmentsRouter);

// root route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});