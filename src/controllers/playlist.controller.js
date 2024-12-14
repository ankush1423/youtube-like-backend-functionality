import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !description)
    {
        throw new ApiError(400,"both feilds are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : req.user?._id
    })
    if(!playlist)
    {
        throw new ApiError(400,"error while creating the playlist")
    }
    return res 
           .status(200)
           .json(
               new ApiResponse(
                   200,
                   playlist,
                   "Playlist is created"
               )
           )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId))
    {
        throw new ApiError(400,"error in getting user ID")
    }

    const playlists = await Playlist.find({owner : userId})

    if(!playlists)
    {
        throw new ApiError(400,"error while mgetting the user playlists")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                   200,
                   playlists,
                   "user all playlists are here"
              )
           )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId)
    {
        throw new ApiError(400,"error while getting the playlistId")
    }

    const playlist = await Playlist.aggregate([
          {
              $match : {
                 _id : new mongoose.Types.ObjectId(playlistId)
              }
          },
          {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline : [
                     {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        email : 1,
                                        username : 1,
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
                ]
             }
          }
    ])

    if(!playlist)
    {
        throw new ApiError(400,"Error while getting playlist with id")
    }

    return res
           .status(200)
           .json(
               new ApiResponse(
                  200,
                  playlist,
                  "user playlist are here"
               )
           )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    {
        throw new ApiError(400,"both are required")
    }

    const videoAdded =  await Playlist.findByIdAndUpdate(
         playlistId,
         { 
            $addToSet: { 
                videos: new mongoose.Types.ObjectId(videoId) 
            } 
         },
         {
            new : true,
         }
    )
    
    if(!videoAdded)
    {
        throw new ApiError(400,"error while adding the video")
    }

    return res
           .status(200)
           .json(
               new ApiResponse(
                   200,
                   {},
                   "video added successfully to playlist"
               )
           )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || !videoId)
    {
        throw new ApiError(400,"both ids are required")
    }

    const deletedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull : {
                videos : new mongoose.Types.ObjectId(playlistId) 
            }
        },
        {
            new : true
        }
    )
     console.log(deletedVideo)
    if(!deletedVideo)
    {
        throw new ApiError(400,"error while deleting video from playlist")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                  200,
                  {},
                  "video deleted successfully"
              )
           )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"error while getting the id")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist)
    {
        throw new ApiError(400,"error while deleting the playlist")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                   200,
                   {},
                   "playlist deleted sucsessfully"
              )
           )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId) || !name || !description)
    {
        throw new ApiError(400,"id name and description all are requied")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set : {
                name : name,
                description : description,
            }
        },
        {
            new : true
        }
    )

    if(!updatedPlaylist)
    {
        throw new ApiError(400,"error while updating the playl;ist")
    }

    return res
           .status(200)
           .json(
               new ApiResponse(
                   200,
                   updatedPlaylist,
                   "playlist updated sucessfully"
               )
           )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
