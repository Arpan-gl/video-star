import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateRefreshAndAccessToken = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = await user.getAccessToken();
        const refreshToken = await user.getRefreshYoken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating reference and access token");
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    // Steps:-
    // 1. get user detail from frontend.
    // 2. validate user detail. - not empty
    // 3. check if user is exist: username or email.
    // 4. check for image and for avatar.
    // 5. upload them into cloudinary.
    // 6. create user object and save in db.
    // 7. remove password and refersh token field from response.
    // 8. check for user creation.
    // 9. give response.


    const {fullName,email,username,password}=req.body;
    
    if(
        [fullName,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const userExist = await User.findOne({$or: [{username},{email}]});

    if(userExist){
        throw new ApiError(409,"User already exist with this username or email")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let  coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Please provide avatar image 1");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Please provide avatar image");
    }

    const user = await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200,"User Registered Successfully",createdUser)
    )
})

const loginUser = asyncHandler(async (req,res)=>{
    // Steps:-
    // 1. get user detail from frontend.
    // 2. validate user detail. - not empty
    // 3. check if user exist: username or email.
    // 4. check password.
    // 5. generate access token and refresh token. and save reference token to db.
    // 6. send as cookie.
    // 7. give response.

    const {username,email,password} = req.body;
    
    if(!(username || email)){
        throw new ApiError(400,"username or email are required");
    }

    const userExist = await User.findOne({$or : [{username},{email}]});
    if(!userExist){
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid = await userExist.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateRefreshAndAccessToken(userExist._id);

    const loggedInUser = await User.findById(userExist._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,"User Logged in Successfully",{
            user: loggedInUser,
            accessToken,
            refreshToken
        })
    )
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken: undefined
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, "User Logged out Successfully")
    )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(404, "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const {accessToken, newrefreshToken} = await generateRefreshAndAccessToken(user._id);
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newrefreshToken, options)
       .json(
            new ApiResponse(200, "User refreshed successfully",{accessToken,refreshToken:newrefreshToken})
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

export {registerUser,loginUser,logoutUser,refreshAccessToken};