import AgentAPI from "apminsight";
AgentAPI.config()

import express from "express";
import cors from "cors";
import 'dotenv/config';

import subjectsRouter from "./routes/subjects.js";
import securityMiddleware from "./middleware/security.js";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth";

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is required for CORS configuration');
}
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
// Better-auth path with middleware
app.all('/api/auth/*splat',toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);

app.use('/api/subjects', subjectsRouter)

app.get("/", (req, res) => {
    res.send("Hello World! Welcome to the API!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});