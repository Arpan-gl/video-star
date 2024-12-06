import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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

export {registerUser};