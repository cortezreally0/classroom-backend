import express from "express";
import cors from "cors";
import 'dotenv/config';

import subjectsRouter from "./routes/subjects";

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

app.use(express.json());

app.use('/api/subjects', subjectsRouter)

app.get("/", (req, res) => {
    res.send("Hello World! Welcome to the API!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});