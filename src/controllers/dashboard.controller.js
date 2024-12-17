import {Video} from "../models/video.models.js";
import {Subscription} from "../models/subscription.models.js";
import {Like} from "../models/like.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req,res)=>{
    const user = req.user._id;

    const videoCount = await Video.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(user)
            }
        },
        {
            $group:{
                _id:"$videoFile",
                totalVideos:{
                    $sum:1
                },
                totalViews:{
                    $sum:"$views"
                }
            }
        },
        {
            $project:{
                _id:0,
                totalVideos:1,
                totalViews:1
            }
        }
    ]);

    const SubscriptionCount = await Subscription.aggregate([
        {
            $match:{
                channel:mongoose.Types.ObjectId(user)
            }
        },
        {
            $group:{
                _id:null,
                totalSubscribers:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalSubscribers:1
            }
        }
    ]);

    const videoLikeCount = await Like.aggregate([
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails"
            }
        },
        {
            $match:{
                "videoDetails.owner":user
            }
        },
        {
            $group:{
                _id:null,
                totalVideoLike:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalVideoLike:1
            }
        }
    ]);

    const commentLikeCount = await Like.aggregate([
        {
            $lookup:{
                from:"comments",
                localField:"comment",
                foreignField:"_id",
                as:"commentDetails"
            }
        },
        {
            $match:{
                "commentDetails.user":user
            }
        },
        {
            $group:{
                _id:null,
                totalCommentLikes:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalCommentLikes:1
            }
        }
    ]);

    const tweetLikesCount = await Like.aggregate([
        {
            $lookup:{
                from:"tweets",
                localField:"tweet",
                foreignField:"_id",
                as:"tweetDetails"
            }
        },
        {
            $match:{
                "tweetDetails.owner":user
            }
        },
        {
            $group:{
                _id:null,
                totalTweetLikes:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                totalTweetLikes:1
            }
        }
    ]);

    const data={
        videoCount:videoCount[0]?.totalVideos?? 0,
        videoViews: videoCount[0]?.totalViews?? 0,
        subscriptionCount: SubscriptionCount[0]?.totalSubscribers?? 0,
        videoLikeCount: videoLikeCount[0]?.totalVideoLike?? 0,
        commentLikeCount: commentLikeCount[0]?.totalCommentLikes?? 0,
        tweetLikeCount: tweetLikesCount[0]?.totalTweetLikes?? 0
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Channel Stats fetched successfully", data)
    )
});

const getChannelVideos = asyncHandler(async (req,res)=>{
    const user = req.user._id;

    const videos = await Video.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(user)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                _id:1,
                title:1,
                description:1,
                createdAt:1,
                views:1,
                videoFile:1,
                thumbnail:1,
                isPublished:1,
                owner:1
            }
        }
    ]);

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Channel videos fetched successfully", videos)
    )
});

export {
    getChannelStats,
    getChannelVideos
};