require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Redis = require('ioredis')
const helmet = require('helmet')
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const logger = require('./utils/logger.js')
const proxy = require('express-http-proxy')


const app = express()
const port = process.env.PORT


const redisClient = new Redis(process.env.REDIS_URL)


//middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res)=>{
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${req.body}`)
    next()
})


const endpointrateLimit = new rateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: 50, //50 request in 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res)=>{
        logger.info(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({success: false, message: `Too many requests`});
    },
    store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args)
    })
})


app.use(endpointrateLimit)


//implementing proxy to route request from 3000 to 3001
const proxyOptions = {
    proxyReqPathResolver: (req)=>{
        return req.originalUrl.replace(/^\/v1/, '/api')
    },
    proxyErrorHandler: (err, res, next)=>{
        logger.error(`Proxy error: ${err.message}`);
        res.status(500 || err.status).json({
            message: `Internal server error: ${err.message}`
        })
    }
}


//setting up proxy for our identity service
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq)=>{
        proxyReqOpts.headers['Content-Type'] = 'application/json'
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes)=>{    //this userResDeco is called after response from proxy service
        logger.info(`Response received from identity service: ${proxyRes.statusCode}`)

        return proxyResData
    }
}))


