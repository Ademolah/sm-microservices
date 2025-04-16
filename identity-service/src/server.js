require('dotenv').config()
const mongoose = require('mongoose')
const logger = require('./utils/logger.js')
const express = require('express')
const helmet = require('helmet')
const {configuredCors} = require('./config/corsConfig.js')
const errorHandler = require('./middlewares/errorHandler.js')
const {RateLimiterRedis} = require('rate-limiter-flexible')
const Redis = require('ioredis')



//connect to database
try {
    logger.info('Connected to database successfully')
    mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to database successfully')
} catch (error) {
    console.error(`Something went wrong: ${error}`)
}

// mongoose.connect(process.env.MONGO_URI).then(()=> logger.info('connected to database successfully')).catch((error)=>console.log(`Something went wrong: ${error}`))
const redisClient = new Redis(process.env.REDIS_URL)



const app = express()


//middleware
app.use(helmet())
app.use(configuredCors)
app.use(express.json())
app.use(errorHandler)


app.use((req,res, next) => {
    logger.info(`Received ${req.method} request to ${req.url} `)
    logger.info(`Request body, ${req.body}`)
    next()
})

//DDoS protection and rate limiting 
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    point: 10,
    duration: 1
})


app.use((req, res,next)=>{
    rateLimiter.consume(req.ip).then(()=> next()).catch(()=> {
        logger.warn(`Rate limit exceeded for ${req.ip}`)
        res.status(400).json({success: false, message: 'Too many requests'})
    })
})

