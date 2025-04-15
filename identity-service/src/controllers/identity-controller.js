
const logger = require('../utils/logger.js')
const {validateRegistration} = require('../utils/validation.js')
const User = require('../models/userModel.js')
const generateTokens = require('../utils/generateToken.js')




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
                error: error.details[0].message
            })
        }

        const {username, email,password} = req.body
        const user = await User.findOne({ $or: [{email}, {username}]})

        if(user){
            logger.warn('Validation error', error.details[0].message)
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            })
        }

        if(user){
            logger.warn('User already exists')
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            })
        }

        user = new User({username, email, password})
        await user.save()
        logger.warn('User saved successfully', user._id)

        const {} = generateTokens(user)

    } catch (error) {
        
    }
}

//user login
const loginUser = async (req, res)=>{

}


//refresh token


//user logout