import { Router } from 'express';

import {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
} from "../controllers/comment.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getComments:videoId").post(verifyJWT, getVideoComments);

router.route("/addComment:videoId").post(verifyJWT, addComment);

router.route("/deleteComment").post(verifyJWT, deleteComment);

router.route("/updateComment").post(verifyJWT, updateComment);

export default router;