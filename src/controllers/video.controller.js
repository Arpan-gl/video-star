import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import mongoose, {isValidObjectId} from "mongoose";

const publishAVideo = asyncHandler(async (req,res)=>{
    const {title, description} = req.body;
    if(!(title || description)){
        throw new ApiError(400,"Title or description are required");
    }

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400,"Please provide video file");
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Please provide thumbnail image");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile.url){
        throw new ApiError(400,"Error while uploading on video");
    }

    if(!thumbnail.url){
        throw new ApiError(400,"Error while uploading on thumbnail");
    }

    const video = await Video.create({
        title:title,
        description:description,
        videoFile:videoFile.url,
        thumbnail: thumbnail.url,
        duration:videoFile.duration,
        views,
        owner:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video published successfully",video)
    )
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
   .status(200)
   .json(
       new ApiResponse(200, "Video fetched successfully", video)
    )
});
 
const updateVideoById = asyncHandler(async (req, res) =>{
    const {videoId} = req.params;
    const {title, description} = req.body;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video ID is required");
    }

    if(!(title || description)){
        throw new ApiError(400,"Title or description are required");
    }

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Please provide thumbnail image");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail.url){
        throw new ApiError(400,"Error while uploading on thumbnail");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title,
                description:description,
                thumbnail:thumbnail.url
            }
        },
        {new: true}
    )

    return res
   .status(200)
   .json(
       new ApiResponse(200,"Video updated successfully",updatedVideo)
    )
});

const deleteVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID is required");
    }

    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
       new ApiResponse(200,"Video deleted successfully",{})
    )
});

const toggleVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID is required");
    }

    if(Video.findById(videoId).owner !== req.user._id) {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:!(Video.isPublished)
            }
        },
        {new: true}
    )

    return res
   .status(200)
   .json(
       new ApiResponse(200,"Video status toggled successfully",video)
    )
})

const getAllVideos = asyncHandler(async (req,res)=>{
    const {page,limit,query,sortBy,sortType,userId} = req.query
    page=1;
    limit=10;
    query=query||"";

    const videos = await Video.aggregate([
        {
            $match:{
                $or:[
                    {
                        title:{$regex:query, $options:"i"}
                    },
                    {
                        description:{$regex:query, $options:"i"}
                    }
                ]
            },
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerInfo"
            },
            $unwind:"$ownerInfo",
            $sort:{
                [sortBy]:sortType=="asc"?1:-1
            },
            $skip: (page-1)*limit,
            $limit:limit,
            $project:{
                _id:1,
                title:1,
                description:1,
                videoFile:1,
                thumbnail:1,
                views:1,
                owner:{
                    _id: "$ownerInfo._id",
                    username: "$ownerInfo.username",
                    fullName: "$ownerInfo.fullName",
                    avatar: "$ownerInfo.avatar"
                },
                createdAt:1,
                isPublished:1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Videos fetched successfully",videos)
    )

})

export {
    publishAVideo,
    getVideoById,
    updateVideoById,
    deleteVideoById,
    toggleVideoById,
    getAllVideos
};