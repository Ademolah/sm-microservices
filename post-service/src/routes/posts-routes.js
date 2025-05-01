const express = require('express')
const {createPost} = require('../controllers/post-controller')
const {authenticateRequest} = require('../middleware/authMiddleware.js')

const router = express()


// all requests must be authenticated
router.use(authenticateRequest)

router.post('/create-post', createPost)




module.exports = router