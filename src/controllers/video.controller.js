import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import fs from "fs"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {}
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    if(query)
    {
        filter.title = {$regex : query , $options : 'i'}
    }

    if(userId)
    {
        filter.owner = userId
    }

    const sortOrder = sortType.toLowerCase() === 'asc' ? 1 : -1
    const sortOptions = {[sortBy] : sortOrder}

    const videos = await Video.find(filter).sort(sortOptions).skip((pageNumber-1)*limitNumber).limit(limitNumber)
    
    return res 
           .status(200)
           .json(
               new ApiResponse(
                   200,
                   videos,
                   "All videos of a user"
               )
           )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // console.log(req.body)
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description)
    {
        throw new ApiError(400,"Please provide the title and description")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath || !thumbnailLocalPath)
    {
        throw new ApiError(400,"Error on finding path of the video and thumbnal")
    }

    const videoRefrence = await uploadOnCloudinary(videoLocalPath)
    if(!videoRefrence)
    {
        throw new ApiError(400,"error while uploading the video")
    }
    const thumbnailRefrence = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailRefrence)
    {
        throw new ApiError(400,"Error while uploading the thumbnail")
    }
    try {
        fs.unlink(videoLocalPath)
        fs.unlink(thumbnailLocalPath)
    }catch(error)
    {
        console.log("Error while dleteting files on server")
    }
    const video = await Video.create({
        videoFile : videoRefrence?.url,
        thumbnail : thumbnailRefrence?.url,
        title :title,
        description : description,
        duration: videoRefrence.duration,
        owner : req.user?._id
    })

    return res 
           .status(200)
           .json(
               new ApiResponse(
                    200,
                    video,
                    "videos uploded successfully"
               )
           )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId)
    {
        throw new ApiError(400,"please provide the id")
    }

    const video = await Video.findById(videoId)
    if(!video)
    {
        throw new ApiError(400,"video with this id not found")
    }
     
    return res 
           .status(200)
           .json(
               new ApiResponse(
                    200,
                    video,
                    "video found successfully"
               )
           )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId)
    {
        throw new ApiError(400,"please provide the video id")
    }
    
    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath)
    {
        throw new ApiError(400,"error on finding the local path of thumbnail")
    }

    const thumbnailRefrence = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailRefrence)
    {
        throw new ApiError(400,"error on updating thumbnail refrence")
    }
    
    const video = await Video.findByIdAndUpdate(
         videoId,
         {
            $set : {
                thumbnail : thumbnailRefrence?.url
            }
         },
         {new : true}
    )
    
    return res 
           .status(200)
           .json(
               new ApiResponse(
                  200,
                  video,
                  "video updated successFully"
               )
           )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId)
    {
        throw new ApiError(400,"please provide the videoId")
    }

    const video = await Video.findByIdAndDelete(videoId)
    if(!video)
    {
        throw new ApiError("Error on deleting the video")
    }
    
    return res
           .status(200)
           .json(
               new ApiResponse(
                   200,
                   {},
                   "video deleted successsfully"
               )
           )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId)
    {
        throw new ApiError(400,"please provide the Id")
    }

    const video = await Video.findByIdAndUpdate(
          videoId,
          {
              $set : {
                isPublished : {$not : "$isPublished"}
              }
          },
          {
             new : true
          }
    )

    return res 
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  video,
                  "Published toggle successfully"
              )
           )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
