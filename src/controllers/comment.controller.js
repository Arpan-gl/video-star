import {Comment} from "../models/comment.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose,{isValidObjectId} from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query;
    const userId = req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }
    const comments = await Comment.aggregate([
        {
            $match:{
                $and:[
                    {
                        _id: mongoose.Types.ObjectId(userId)
                    },
                    {
                        video: mongoose.Types.ObjectId(videoId)
                    }
                ]
            },
            $skip:page-1*limit,
            $limit: limit,
            $lookup:{
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userView",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            },
            $unwind : "$userView",
            $addFields:{
                userview:{
                    $first:"$userView",
                }
            },
            $project:{
                content:1,
                userView:1
            }
        }
    ])

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Video comments fetch successfully", comments)
    )
})

const addComment = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {videoId} = req.params;
    const userId = req.user._id;

    if (!(content.length)) {
        throw new ApiError(400, "Please provide comment content");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        user: userId
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comment added successfully", comment)
    )
});

const updateComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;
    const {content} = req.body;
    const userId = req.user._id;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id");
    }

    if(!(content.length)) {
        throw new ApiError(400, "Please provide comment content");
    }

    const oldcommentuserId = await comment.findById(commentId).user

    if(oldcommentuserId !== userId){
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new: true}
    );

    if(!Comment){
        throw new ApiError(404, "Comment not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Comment updated successfully", comment)
    )
});

const deleteComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id");
    }

    const oldcommentuserId = await comment.findById(commentId).user

    if(oldcommentuserId !== userId){
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, "Comment deleted successfully")
    )
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};