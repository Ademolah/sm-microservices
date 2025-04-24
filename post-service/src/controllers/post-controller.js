const Post = require('../models/Post.js')
const logger = require('../utils/logger.js')



const createPost = async (req, res)=>{
    try {
        
    } catch (error) {
        logger.error('Error creating post', error)
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
}

const getAllPosts = async (req, res)=>{
    logger.info('Hitting creating post url...')
    try {

        const post = req.body

        if(!post){
            logger.warn('Missing post inputs')
            return res.status(401).json({
                success: false,
                message: 'Missing post input or body'
            })
        }

        const newPost = new Post({
            user: req.user.userId,
            content: req.content,
            mediaIds: req.mediaIds
        })
    
        await newPost.save()

        logger.info(`New post created by ${req.user.userId}`)
        
        res.status(201).json({
            success: true,
            message: 'New post created successfully',
            newPost: post
        })

    } catch (error) {
        logger.error('Error retrieving posts', error)
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
}


const getPost = async (req, res)=>{
    try {
        
    } catch (error) {
        logger.error('Error retrieving post', error)
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
}

const deletePost = async (req, res)=>{
    try {
        
    } catch (error) {
        logger.error('Error deleting posts', error)
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
}


module.exports = {createPost, getAllPosts, getPost, deletePost}



