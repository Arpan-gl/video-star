import {Playlist} from "../models/playlist.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose, {isValidObjectId} from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name,description} = req.body;

    if(!name || !description){
        throw new ApiError(400,"Name and description are required");
    }

    const existingPlaylist = await Playlist.findOne({
        $and: [{ name: name }, { owner: req.user._id }]
    });
    
    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with this name already exists");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist created successfully", playlist)
    )
});

const getUserPlaylists = asyncHandler(async (req,res)=>{
    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline:[
                                {
                                    $project:{
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first : "$videoOwner",
                            }
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            title:1,
                            description:1,
                            videoFile:1,
                            thumbnail:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from : "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$ownerInfo",
                }
            }
        },
        {
            $project:{
                videos:1,
                owner:1,
                createdAt:1,
                name:1,
                description:1
            }
        }
    ]).toArray();

    if(!playlist.length){
        throw new ApiError(404, "No playlists found for this user");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Playlists fetched successfully", playlist)
    )
});

const getPlaylistById = asyncHandler(async (req,res)=>{
    const {playlistId} = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline:[
                                {
                                    $project:{
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first : "$videoOwner",
                            }
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            title:1,
                            description:1,
                            videoFile:1,
                            thumbnail:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from : "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$ownerInfo",
                }
            }
        },
        {
            $project:{
                videos:1,
                owner:1,
                createdAt:1,
                name:1,
                description:1
            }
        }
    ]).toArray();

    if(!playlist.length){
        throw new ApiError(404, "No playlist found for this id");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Playlist fetched successfully", playlist)
    )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId,videoId} = req.params;
    const playlist = await Playlist.findById(playlistId);

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlistOwner = playlist.owner;

    if(playlistOwner!==req.user._id){
        throw new ApiError(401, "Unauthorized access");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const VideoExist = playlist.videos.filter((video)=>video.id === videoId);
    
    if(VideoExist.length){
        throw new ApiError(400, "Video already exists in this playlist");
    }

    const addVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                videos: [...playlist.videos, mongoose.Types.ObjectId(videoId)]
            }
        },
        { new: true }
    );

    if(!addVideo){
        throw new ApiError(404, "Playlist not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Video added to playlist successfully", addVideo)
    )
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    const playlist = await Playlist.findById(playlistId);

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlistOwner = playlist.owner;

    if(playlistOwner!==req.user._id){
        throw new ApiError(401, "Unauthorized access");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const VideoExist = playlist.videos.filter((video)=> video.id === videoId);

    if(!VideoExist.length){
        throw new ApiError(400, "Video does not exist in this playlist");
    }

    const removeVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                videos: playlist.videos.filter((video)=>video.id!== videoId)
            }
        },
        { new: true }
    );

    if(!removeVideo){
        throw new ApiError(404, "Playlist not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Video removed from playlist successfully", removeVideo)
    )
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlistOwner = await Playlist.findById(playlistId).owner;

    if(playlistOwner!==req.user._id){
        throw new ApiError(401, "Unauthorized access");
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletePlaylist){
        throw new ApiError(404, "Playlist not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Playlist deleted successfully",{})
    )
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body;

    if(!(name || description)){
        throw new ApiError(400, "Name or description is required");
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlistOwner = await Playlist.findById(playlistId).owner;

    if(playlistOwner!==req.user._id){
        throw new ApiError(401, "Unauthorized access");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },
        { new: true }
    );

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Playlist updated successfully", updatedPlaylist)
    )
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};