import {Router} from 'express';

import {
    publishAVideo,
    getVideoById,
    updateVideoById,
    deleteVideoById,
    toggleVideoById,
    getAllVideos
} from "../controllers/video.controller.js"

import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/publish-video').post(upload.fields([
    {
        name: 'thumbnail',
        maxCount: 1
    },
    {
        name: 'video',
        maxCount: 1
    }
]),verifyJWT,publishAVideo);

router.route('/get-video/:videoId').get(getVideoById);

router.route('/update-video/:videoId').patch(upload.single("thumbnail"),updateVideoById);

router.route('/delete-video/:videoId').delete(deleteVideoById);

router.route('/toggle-video/:videoId').post(verifyJWT,toggleVideoById);

router.route('/get-all-videos').get(getAllVideos);

export default router;