import { Router } from 'express';

import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/channle-status').get(verifyJWT,getChannelStats);

router.route('/channel-videos/:channelId').get(verifyJWT,getChannelVideos);

export default router;