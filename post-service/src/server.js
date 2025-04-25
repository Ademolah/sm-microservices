require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Redis = require('ioredis')
const postRoute = require('./routes/posts-routes.js')
const errorHandler = require('./middleware/errorHandler.js')
const logger = require('./utils/logger.js')
const {RateLimiterRedis} = require('rate-limiter-flexible')

const app = express()
const port = process.env.PORT


//connect to database
mongoose.connect(process.env.MONGO_URI).then(()=>logger.info('Connected to database successfully'))
.catch((error)=>logger.error(`Error: ${error}`))


//middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())


app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next()
})

//DDoS protection and rate limiting 
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    point: 10,
    duration: 1
})

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limit exceeded for ip ${req.ip}`);
        res.status(429).json({success: false, message: 'Too many request'})
    })
})
