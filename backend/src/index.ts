import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { connectRedis } from "./lib/redis.js";

const port = process.env.PORT;

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("server working...");
});

app.use("/api/auth", authRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).send("API not found.");
});

// Error handler — should be last
app.use(errorHandler);

await connectRedis();

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});