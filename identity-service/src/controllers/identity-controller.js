
const logger = require('../utils/logger.js')
const {validateRegistration, validateLogin} = require('../utils/validation.js')
const User = require('../models/userModel.js')
const generateTokens = require('../utils/generateToken.js')
const argon2 = require('argon2')




//user registration
const registerUser = async (req,res)=>{
    logger.info('Registration endpoint...')
    try {
        
        //validate schema
        const {error} = validateRegistration(req.body)
        if(error){
            logger.warn('Validation error', error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const {username, email,password} = req.body
        let user = await User.findOne({ $or: [{email}, {username}]})

        if(user){
            logger.warn('User already exists')
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        user = new User({username, email, password})
        await user.save()
        logger.warn('User saved successfully', user._id)

        const {accessToken, refreshToken} = await generateTokens(user)


        res.status(201).json({
            success: true,
            message: 'User created successfully',
            refreshToken,
            accessToken
        })

    } catch (error) {
        logger.error('Registration error', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

//user login
const loginUser = async (req, res)=>{
    logger.info('login endpoint hit...')

    try {
        const {error} = validateLogin(req.body)
        if(error){
            logger.warn('Validation error', error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const {username, email, password} = req.body 

        const user = await User.findOne({$or: [{username}, {email}]})

        if(!user){
            logger.warn(`User does not exist`)
            return res.status(401).json({
                success: false,
                message: `Invalid credentials`
            })
        }

        //valid password
        const isValidPassword = await user.comparePassword(password) 
        if(!isValidPassword){
            logger.warn(`Invalid password`)
            return res.status(400).json({
                success: false,
                message: `Invalid password`
            })
        }

        const {accessToken, refreshToken} = await generateTokens(user)

        res.status(200).json({
            success: true,
            message: `Login successfully`,
            accessToken,
            refreshToken,
            userId: user._id
        })
        
    } catch (error) {
        logger.error('login error', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}


//refresh token


//user logout

module.exports = {registerUser, loginUser}