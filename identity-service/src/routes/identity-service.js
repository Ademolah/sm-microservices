const express = require('express')
const {registerUser} = require('../controllers/identity-controller.js')

const router = express.Router()


router.post('/signup', registerUser)




module.exports = router