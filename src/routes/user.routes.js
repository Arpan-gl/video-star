import {Router} from 'express';

import { 
    loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from '../controllers/user.controller.js';

import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-Token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT,changeCurrentPassword);

router.route("/User-detail").post(verifyJWT,getCurrentUser);

router.route("/update-account-details").post(verifyJWT, updateAccountDetails);

router.route("/update-avatar").post(upload.single(avatar),verifyJWT, updateUserAvatar);

router.route("/update-coverImage").post(upload.single(coverImage),verifyJWT, updateUserCoverImage);

export default router;