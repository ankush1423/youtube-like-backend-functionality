import mongoose, {isValidObjectId, mongo} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"error while getting the channel and userId")
    }

    const existingSuscriber = await Subscription.findOne({
        subscriber : new mongoose.Types.ObjectId(req.user?._id),
        channel : channelId
    })

    if(existingSuscriber)
    {
        await existingSuscriber.deleteOne()
        return res
               .status(200)
               .json(
                  new ApiResponse(
                      200,
                      {},
                      "Channel Unsubscribed"
                  )
               )
    }
    else
    {
        const subscribed = await Subscription.create(
            {
                subscriber : new mongoose.Types.ObjectId(req.user?._id),
                channel : channelId
            } 
        )

        if(!subscribed)
        {
            throw new ApiError(400,"error while creating a subscribed document")
        }

        return res
               .status(200)
               .json(
                   new ApiResponse(
                       200,
                       subscribed,
                       "User Suscribed successFully"
                   )
               )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    console.log(req.params)
    const {subscriberId} = req.params
    
    if(!isValidObjectId(subscriberId))
    {
        throw new ApiError(400,"error while getting the channelId")
    }

    // const subscriberList = await Subscription.aggregate([
    //      {
    //         $match : {
    //             channel : new mongoose.Types.ObjectId(channelId)
    //         }
    //      },
    //      {
    //        $lookup : {
    //           from : "users",
    //           localField : "subscriber",
    //           foreignField : "_id",
    //           as : "suscribers",
    //           pipeline : [
    //               {
    //                  $project : {
    //                     email : 1,
    //                     fullName : 1,
    //                     username : 1
    //                  }
    //               }
    //           ]
    //        }
    //      },
    //      {
    //         $addFields : {
    //             totalSuscribers : {
    //                  $size : "$suscribers"
    //             }
    //         }
    //      },
    //      {
    //         $project : {
    //             suscribers : 1,
    //             totalSuscribers : 1
    //         }
    //      }
    // ])
    
    const subscriberList = await Subscription.find({channel : subscriberId})
    console.log(subscriberList)
    if(!subscriberList)
    {
        throw new ApiError(400,"error while getting subscriberList")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  subscriberList,
                  "list of all susscribers"
              )
           )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"error while getting channelId")
    }

    const suscriberedChannelList = await Subscription.aggregate([
         {
            $match : {
                subscriber : new mongoose.Types.ObjectId(channelId)
            }
         },
         {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channels",
                pipeline : [
                    {
                        $project : {
                            email : 1,
                            fullName : 1,
                            username : 1
                        }
                    }
                ]
            },
         },
         {
             $addFields : {
                channels : {
                    $first : "$channels"
                }
             }
         },
         {
            $project : {
                channels : 1
            }
         }
    ])
    console.log(suscriberedChannelList)
    if(!suscriberedChannelList)
    {
        throw new ApiError(400,"error while crating suscriber list")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                   200,
                   suscriberedChannelList,
                   "all list of suscribed channels"
              )
           )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}