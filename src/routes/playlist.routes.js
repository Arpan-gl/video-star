import { Router } from 'express';

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);

router.route("/getUserPlaylists/:userId").post(getUserPlaylists);

router.route("/getPlaylistById/:playlistId").post(getPlaylistById);

router.route("/addVideoToPlaylist/:playlistId/:videoId").post(verifyJWT, addVideoToPlaylist);

router.route("/removeVideoFromPlaylist/:playlistId/:videoId").post(verifyJWT, removeVideoFromPlaylist);

router.route("/deletePlaylist/:playlistId").post(verifyJWT, deletePlaylist);

router.route("/updatePlaylist/:playlistId").post(verifyJWT, updatePlaylist);

export default router;