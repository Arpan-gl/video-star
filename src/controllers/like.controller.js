import {Like} from "../models/like.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose, {isValidObjectId} from "mongoose";

const toggleVideoLike = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const user = req.user._id;

    if(!user){
        throw new ApiError(401,"Not authenticated");
    }

    const likeVideo = await Like.findOne({
        $and:[{video:videoId},{likedBy:user}]
    })

    if(!likeVideo){
        const like = await Like.create({video:videoId,likedBy:user})
        return res
        .status(200)
        .json(
            new ApiResponse(200,"Video liked successfully",like)
        )
    }
    const like = await Like.deleteOne(likeVideo);

    return res
    .status(200)
   .json(
        new ApiResponse(200,"Video unliked successfully",like)
    )
})

const toggleCommentLike = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id");
    }

    const user = req.user._id;

    if(!user){
        throw new ApiError(401,"Not authenticated");
    }

    const likeComment = await Like.findOne({
        $and:[{comment:commentId},{likedBy:user}]
    })
    if(!likeComment){
        const like = await Like.create({comment:commentId,likedBy:user})
        return res
       .status(200)
       .json(
            new ApiResponse(200,"Comment liked successfully",like)
        )
    }
    const like = await Like.deleteOne(likeComment);
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Comment unliked successfully",like)
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const user = req.user._id;

    if (!user) {
        throw new ApiError(401, "Not authenticated");
    }

    const likeTweet = await Like.findOne({
        $and: [{ tweet: tweetId }, { likedBy: user }]
    })

    if (!likeTweet) {
        const like = await Like.create({ tweet: tweetId, likedBy: user })
        return res
       .status(200)
       .json(
            new ApiResponse(200, "Tweet liked successfully", like)
        )
    }
    const like = await Like.deleteOne(likeTweet);

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Tweet unliked successfully", like)
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const like = await Like.aggregate([
        {
            $match : {
                _id : mongoose.Types.ObjectId(req.user._id)
            },
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "videoDetails",
                pipeline:[
                    {
                        $lookup:{
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "ownerDetails",
                            pipeline:[{
                                $project:{
                                    username: 1,
                                    fullName: 1,
                                    avatar: 1
                                }
                            }]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first : "$ownerDetails",
                            }
                        }
                    },
                    {
                        $project:{
                            description: 1,
                            title:1,
                            owner: 1,
                            videoId: 1,
                            thumbnail: 1
                        }
                    }
                ]
            },
            $unwind : "$videoDetails",
            $addFields:{
                video: "$videoDetails"
            },
            $project:{
                video:1,
                likedBy:1
            }
        }
    ])

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Liked videos fetched successfully", like)
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};