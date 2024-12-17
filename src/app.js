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
import commentRouters from './routes/comment.routes.js';
import tweetRouters from './routes/tweet.routes.js';
import subscriptionRouters from './routes/subscription.routes.js';

// Router declarations
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/video",videoRoutes);
app.use("/api/v1/like",likeRouters);
app.use("/api/v1/comment",commentRouters);
app.use("/api/v1/tweet",tweetRouters);
app.use("/api/v1/subscription",subscriptionRouters);

export {app};