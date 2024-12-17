import { Router } from 'express';

import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/Subscribed-Channel/:subscriberId').get(verifyJWT,getSubscribedChannels);

router.route('/User-Channel-Subscribers/:channelId').get(verifyJWT, getUserChannelSubscribers);

router.route('/Toggle-Subscription/:channelId').put(verifyJWT, toggleSubscription);

export default router;