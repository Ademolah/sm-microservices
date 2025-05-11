require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Redis = require('ioredis')
const errorHandler = require('./middleware/errorHandler.js')
const logger = require('./utils/logger.js')
const {RateLimiterRedis} = require('rate-limiter-flexible')
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const {configuredCors} = require('./config/corsConfig.js')
const helmet = require('helmet')

const mediaRoutes = require('./routes/media-routes.js')

const app = express()
const port = process.env.PORT

mongoose.connect(process.env.MONGO_URI).then(()=>logger.info('Media Connected to database successfully..'))
.catch((err)=>logger.error(`DB Error ${err}`))

const redisClient = new Redis(process.env.REDIS_URL)

app.use(cors())
app.use(helmet())
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


//Prevent DDoS attack 
const endpointsRateLimit = rateLimit({
    windowMs: 15*60*1000 ,//15 minutes
    max: 50,    //50 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res)=>{
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({success: false, message: 'Too many requests'});
    },
    store: new RedisStore({
        sendCommand: (...args)=> redisClient.call(...args)
    })
});


//apply to endpoints
app.use('/api/upload', endpointsRateLimit)


app.use('/api/upload', mediaRoutes)
app.use(errorHandler)


app.listen(port, ()=>{
    logger.info(`Media server connected on port ${port}`)
})


process.on('unhandledRejection', (reason, promise)=>{
    logger.error(`Unhandled rejection at`, promise, 'reason :', reason)
})