const Image = require('../models/Media.js')
const {uploadToCloudinary} = require('../utils/cloudinaryHelpers.js')
const fs = require('fs')
const logger = require('../utils/logger.js')


const uploadImage = async (req, res)=>{

    try {

        //check if file is upload is missing
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'No file uploaded, please upload an image file'
            })
        }

        //upload image to cloudinary
        // const {url, publicId} = await uploadToCloudinary(req.file.path)
        const {originalName, mimeType, buffer} = req.file
        const userId = req.user.userId

        const {url, publicId} = await uploadToCloudinary(req.file.path)

        //store the url and publicId in database
        const newMedia = new Media({
            publicId,
            originalName,
            mimeType,
            url,
            userId
        })

        await newMedia.save()

        //delete file from local storage immediately after upload
        fs.unlinkSync(req.file.path)

        res.status(200).json({
            success: true,
            mediaId: newMedia._id,
            url: newMedia.url,
            message: 'Media uploaded successfully'
        })

        
    } catch (error) {
        logger.error("Error ", error)
        res.status(500).json({
            success: false,
            message: `Something went wrong, ${error}`
        })
    }
}

module.exports = {uploadImage}