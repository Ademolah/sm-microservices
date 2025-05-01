const Post = require('../models/Post.js')
const logger = require('../utils/logger.js')
const {validateCreatePost} = require('../utils/validation.js')



const createPost = async (req, res)=>{
    logger.info('Hitting creating post endpoint ...')
    try {
        //validate schema
        const {error} = validateCreatePost(req.body)
        if(error){
            logger.warn('Validation error', error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const {content, mediaIds} = req.body
        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || [],
        })
    
        await newPost.save()

        logger.info(`New post created by ${req.user.userId}`)
        res.status(201).json({
            success: true,
            message: 'New post created successfully',
            newPost
        })
        
    } catch (error) {
        logger.error('Error creating post', error)
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
}

const getAllPosts = async (req, res)=>{
    logger.info('Hitting get posts url...')
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1) * limit;

        const cacheKey = `post:${page}:${limit}`
        const cachedPosts = await req.redisClient.get(cacheKey)

        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts))
        }

        const posts = await Post.find({}).sort({createdAt:-1}).skip(skip).limit(limit)

        const totalPosts = await Post.countDocuments()

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts/limit),
            totalPost: totalPosts
        }

        //save your post/result in redis client
        await req.redisClient.setex(cacheKey, 500, JSON.stringify(result))

        res.status(200).json({
            success: true,
            result
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



