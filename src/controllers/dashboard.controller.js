import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    //TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const likes = await Like.countDocuments(
        {    
            $or : [
                {  comment : new mongoose.Types.ObjectId(req.user?._id) },
                {  tweet    : new mongoose.Types.ObjectId(req.user?._id) },
                {  video    : new mongoose.Types.ObjectId(req.user?._id) }
            ]
        }
    )

    const subscribers =  await Subscription.countDocuments(
        {
            channel : new mongoose.Types.ObjectId(req.user?._id)
        }
    )
    
    const videos = await Video.countDocuments(
        {
            owner : new mongoose.Types.ObjectId(req.user?._id)
        }
    )

    const result = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group : {
                _id : null,
                totalviews : {
                    $sum : "$views"
                }
            }
        }
    ])

    const totalViews = result[0]?.totalviews || 0

    return res
           .status(200)
           .json(
             new ApiResponse(
                 200,
                 {
                    totalLikes : likes,
                    totalSubscribers : subscribers,
                    totalVideos : videos,
                    totalViews : totalViews
                 },
                 "All statictics of user"
             )
           )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                    {
                        $project : {
                            fullName : 1,
                            email : 1,
                            avatar : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$owner"
                }
            }
        }
    ])

    if(!videos)
    {
        throw new ApiError(400,"error while getting the videos")
    }

    return res
           .status(200)
           .json(
               new ApiResponse(
                  200,
                  videos,
                  "all videos by user"
               )
           )
})

export {
    getChannelStats, 
    getChannelVideos
    }