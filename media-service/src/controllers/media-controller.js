const logger = require('../utils/logger.js')
const {uploadMediaToCloudinary} = require('../utils/cloudinary.js')



const uploadMedia = async(req, res)=>{
    logger.info('Hitting upload endpoint')
    try {

        if(!req.file){
            logger.error('No file uploaded , kindly upload a media file')
            return res.status(401).json({
                success: false,
                message: 'Kindly upload a media file'
            })
        }

        const {originalName, mimeType, buffer} = req.file
        const userId = req.user.userId

        logger.info(`${originalName} : ${mimeType}: ${buffer}: ${userId}`)
        
    } catch (error) {
        logger.error(`Something went wrong: ${error}`)
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
}



module.exports = {uploadMedia}