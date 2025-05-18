const Media = require("../models/Media")
const { deleteMediaFromCloudinary } = require("../utils/cloudinary")


const handlePostDeleted = async (event)=>{
    console.log(event, 'event this')
    const {postId, mediaIds } = event

    try {
        const mediaToDelete = await Media.find({_id: {$in: mediaIds}})

        for(const media of mediaToDelete){
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info(`Deleted media ${media._id} associated with postid ${postId}`)
        }
        logger.info(`Processed deletion for post id ${postId}`)
        
    } catch (error) {
        logger.error('Error occured while deleting media ',error)
    }
}

module.exports = {handlePostDeleted}


