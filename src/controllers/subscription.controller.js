import {User} from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose, {isValidObjectId} from "mongoose";

const toggleSubscription = asyncHandler(async (req,res)=>{
    const {channelId} = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    }

    const subscribedToChannel = await Subscription.findOne({
        $and:[{channed: channelId},{subscriber: userId}]
    })

    await User.findByIdAndUpdate(
        userId,
        {
            $set:{
                isSubscribed:!(User.isSubscribed)
            }
        },
        {new:true}
    )

    if(!subscribedToChannel){
        const subscribed = await Subscription.create({channed: channelId, subscriber: userId});
        return res
        .status(200)
        .json(
            new ApiResponse(200,"Channel Subscribed Successfully",subscribed)
        )
    }

    const unsubscribed = await Subscription.deleteOne(subscribedToChannel);

    return res
   .status(200)
   .json(
        new ApiResponse(200,"Channel Unsubscribed Successfully",{})
    )
});

const getUserChannelSubscribers = asyncHandler(async (req,res)=>{
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match:{
                channed: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber:{
                    $first:"$subscriber",
                }
            }
        },
        {
            $project:{
                subscriber:1,
                createdAt:1
            }
        }
    ])

    if(!subscriberList.length){
        throw new ApiError(404,"No subscribers found for this channel");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200,"Subscriber fetch Successfully",subscriberList)
    )
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params;

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid user id");
    }

    const subscribedChannel = await Subscription.aggregate([
        {
            $match:{
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField: "channed",
                foreignField: "_id",
                as: "channel",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channel:{
                    $first:"$channel",
                }
            }
        },
        {
            $project:{
                _id: 1,
                channel:1,
                createdAt:1
            }
        }
    ])

    if(!subscribedChannel.length){
        throw new ApiError(404,"No subscribed channels found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200,"Subscribed Channels fetch Successfully",subscribedChannel)
    )
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};