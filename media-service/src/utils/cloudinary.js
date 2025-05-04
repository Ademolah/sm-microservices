const cloudinary = require('cloudinary').v2;
const logger = require('./logger.js')


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})



function uploadMediaToCloudinary(file){
    return new Promise(resolve, reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream({
            
        })
    }
}





