import { Router } from 'express';

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createTweet").post(verifyJWT,createTweet);

router.route("/deleteTweet/:tweetid").delete(verifyJWT,deleteTweet);

router.route("/getUserTweets/:userId").get(verifyJWT,getUserTweets);

router.route("/updateTweet/:tweetid").put(verifyJWT,updateTweet);

export default router;