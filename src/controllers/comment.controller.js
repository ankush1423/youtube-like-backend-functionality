import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    const pagelimiter = parseInt(page,10)
    const limitLimiter = parseInt(limit,10)

    if(!videoId)
    {
        throw new ApiError(400,"error while gee=tting video id for comments")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video:new mongoose.Types.ObjectId(videoId), // Convert `videoId` to ObjectId
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline : [
                    {
                        $project : {
                            email : 1,
                            username : 1,
                            fullName : 1
                        }
                    }
                ],
            },
        },
        {
            $unwind : "$owner"
        }
    ])

    return res
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  comments,
                  "All comments are here"
              )
           )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    if(!content || !videoId)
    {
        throw new ApiError(400,"error on getting comment and video id")
    }

    const comment = await Comment.create({
          content : content,
          video   : videoId,
          owner   : req.user?._id
    })

    if(!comment)
    {
        throw new ApiError(400,"error while creating a comment")
    }

    return res 
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  comment,
                  "comment Added succesfully"
              )
           )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if(!commentId || !content)
    {
        throw new ApiError(400,"error while getting the comment Id")
    }

     const updatedComment = await Comment.findByIdAndUpdate(
          commentId,
          {
              $set : {
                 content : content
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
                     updatedComment,
                     "comment updated Successfully"
                 )
            )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId)
    {
        throw new ApiError(400,"error while getting the comment Id")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment)
    {
        throw new ApiError(400,"error while deleting the comment")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  {},
                  "comment deleted Succefully"
              )
           )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
