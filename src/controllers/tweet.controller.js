import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content)
    {
        throw new ApiError(400,"please provide the content")
    }

    const tweet = await Tweet.create({
          content ,
          owner : req.user?._id
    })

    if(!tweet)
    {
        throw new ApiError(400,"error while creating tweet")
    }
    
    return res
           .status(200)
           .json(
              new ApiResponse(
                   200,
                   tweet,
                   "Tweet created successfully"
              )
           )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
     const {_id : userId} = req.user?._id

     const tweets = await Tweet.find({owner:userId})

     return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    tweets,
                    "all tweets are available"
                )
            )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {body : {content} , params : {tweetId}} = req
    if(!tweetId || !content)
    {
        throw new ApiError(400,"error in getting the id and must have content")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content : content
            }
        },
        {
            new : true
        }
    )

    if(!updatedTweet)
    {
        throw new ApiError(400,"error while updating the tweet")
    }

    return res 
           .status(200)
           .json(
             new ApiResponse(
                 200,
                 updatedTweet,
                 "tweet updated successfully"
             )
           )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId)
    {
        throw new ApiError(400,"Error while reading the tweet id")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  {},
                  "tweet deleted successfully"
              )
           )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
