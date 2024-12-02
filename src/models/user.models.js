import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type: String,
        required: true,
        trim:true,
        index:true
    },
    password:{
        type: String,
        required: true
    },
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    avatar:{
        type: String,  // cloudinary url
        required: true
    },
    coverImage:{
        type: String
    },
    refreshToken:{
        type: String
    }
},{timestamps:true});

userSchema.pre("save", async function (next){
    if(!(this.isModified("password"))) return next();
    this.password = bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.getAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
    )
}

userSchema.methods.getRefreshYoken= function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    )
}

export const User = mongoose.model('User',userSchema);