import {Tweet} from "../models/tweet.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req,res)=>{
    const { content } = req.body;
    const userId = req.user._id;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    if(!content.length){
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        owner: userId,
        content
    });

    return res
   .status(200)
   .json(
        new ApiResponse(201, "Tweet created successfully", tweet)
    )
});

const getUserTweets = asyncHandler(async (req,res)=>{
    const {userId } = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id");
    }

    const tweets = await Tweet.find({owner: userId});

    if(!(tweets.length)){
        throw new ApiError(404, "User does not have any tweets");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "User tweet fetch successfully", tweets)
    )
});

const updateTweet = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params;
    const { content } = req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }

    if(!(content.length)){
        throw new ApiError(400, "Content is required");
    }

    const oldTweeet = await Tweet.findById(tweetId);

    if(oldTweeet.owner !== req.user._id){
        throw new ApiError(401, "Unauthorized access");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        {
            $set: {
                content
            }
        },
        {new: true}
    );

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Tweet updated successfully", tweet)
    )
});

const deleteTweet = asyncHandler(async (req,res)=>{
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }
    
    const oldTweeet = await Tweet.findById(tweetId);

    if(oldTweeet.owner !== req.user._id){
        throw new ApiError(401, "Unauthorized access");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Tweet deleted successfully")
    )
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};