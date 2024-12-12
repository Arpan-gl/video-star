import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Router
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import likeRouters from './routes/like.routes.js';

// Router declarations
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/video",videoRoutes);
app.use("/api/v1/like",likeRouters);

export {app};