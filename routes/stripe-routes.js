const express = require('express')
const router = express.Router()

//generate client secret
const {createPaymentIntent} = require('../controllers/stripe-controllers')

const {authCheck} = require('../middleware/auth')

router.post('/create-payment-intent', authCheck, createPaymentIntent)

module.exports = router