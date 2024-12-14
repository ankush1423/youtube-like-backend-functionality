import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"error while getting the video Id")
    }
    
    const existingLike = await Like.findOne({video : videoId , likedBy : req.user?._id})

   if(existingLike)
   {
       await existingLike.deleteOne()
       await Video.findByIdAndUpdate(
           videoId,
           {
               $set : {
                  isLiked : false
               }
           },
           {
              new  : true
           }
       )
       return res
              .status(200)
              .json(
                  new ApiResponse(
                      200,
                      {},
                      "video disliked sussessfully"
                  )
              )
   }
   else
   {    
        
        const LikedVideo = await Like.create(
            {
               video : new mongoose.Types.ObjectId(videoId),
               likedBy : new mongoose.Types.ObjectId(req.user?._id)
            }
        )

        if(!LikedVideo)
        {
            throw new ApiError(500,"error on liked a video")
        }
        
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set : {
                    isLiked : true
                }
            }
        )

        if(!video)
        {
            throw new ApiError(500,"error while finding a video")
        }
        
        return res
               .status(200)
               .json(
                  new ApiResponse(
                      200,
                      {},
                      "video Liked successFully"
                  )
               )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId)
    {
        throw new ApiError(400,"error while getting comment Id")
    }

    const existingLike = await Like.findOne({comment : commentId , likedBy : req.user?._id})

    if(existingLike)
    {
        await existingLike.deleteOne()
        await Comment.findByIdAndUpdate(
            commentId,
            {
                $set : {
                    isLiked : false
                }
            }
        )
        return res
               .status(200)
               .json(
                  new ApiResponse(
                      200,
                      {},
                      "comment dislike successfully"
                  )
               )
    }
    else
    {
         const likedComment = await Like.create(
            {
                comment : new mongoose.Types.ObjectId(commentId),
                likedBy : new mongoose.Types.ObjectId(req.user?._id)
            }
         )

         if(!likedComment)
         {
            throw new ApiError(400,"error while liked a comment")
         }

         const comment = await Comment.findByIdAndUpdate(
              commentId,
              {
                  $set : {
                     isLiked : true
                  }
              }
         )

         if(!comment)
         {
             throw new ApiError(400,"error while updating a comment")
         }

         return res
                .status(200)
                .json(
                     new ApiResponse(
                         200,
                         {},
                         "video Liked suscessfully"
                     )
                )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"error while getting the tweetid")
    }

    const existingLike = await Like.findOne({tweet : tweetId , likedBy : req.user?._id})

    if(existingLike)
    {
        await existingLike.deleteOne()
        await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set : {
                    isLiked : false
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
                      {},
                      "tweet dislike sussessfully"
                  )
               )
    }
    else
    {
        const likedTweet = await Like.create(
            {
                tweet : new mongoose.Types.ObjectId(tweetId),
                likedBy : new mongoose.Types.ObjectId(req.user?._id)
            }
        )
        if(!likedTweet)
        {
            throw new ApiError(500,"error on liked a tweet")
        }

        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set : {
                    isLiked : true
                }
            }
        )

        if(!updatedTweet)
        {
            throw new ApiError(500,"error on updating the tweet")
        }

        return res
               .status(200)
               .json(
                  new ApiResponse(
                      200,
                      {},
                      "tweet Liked SuccessFully"
                  )
               )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos = await Like.aggregate([
         {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user?._id)
            }
         },
         {
            $lookup : {
                 from : "videos",
                 localField : "video",
                 foreignField : "_id",
                 as : "video",
            }
         },
         {
            $project : {
                video : 1,
            }
         }
    ])

    if(!videos)
    {
        throw new ApiError(500,"error on getting the videos")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  videos,
                  "all videos which are liked by user"
              )
           )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}