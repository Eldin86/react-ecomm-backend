const User = require('../models/user-model')
const Cart = require('../models/cart-model')
const Product = require('../models/product-model')
const Coupon = require('../models/coupon-model')
//Also restart server after we use this env variable
const stripe = require('stripe')(process.env.STRIPE_SECRET)

exports.createPaymentIntent = async (req, res) => {
    const { couponApplied } = req.body

    //apply coupon
    //1. find user
    const user = await User.findOne({ email: req.user.email }).exec()

    //2. get loged in users cart total
    const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderdBy: user._id }).exec()
    console.log('cartTotal', cartTotal, 'totalAfterDiscount', totalAfterDiscount)

    let finalAmount = 0

    //if coupon is applied and have totalAfterDiscount 
    if (couponApplied && totalAfterDiscount) {
        finalAmount = totalAfterDiscount * 100 //multiply with 100 cents
    } else {
        finalAmount = cartTotal * 100 //multiply with 100 cents
    }

    //create payment intent with order amount and currency
    //calculate prices -> accepts amount, currency, 
    const paymentIntent = await stripe.paymentIntents.create({
        //posto rade sa centima kad trebamo unijeti iznos novca moramo pomnoziti za 100 ukoliko zelimo 100 dolara moramo koritstiti 100$ * 100
        amount: finalAmount, //Because stripe calculates in cents we have to multiply with 100
        currency: "usd",
    });
    //return client secret which is needed to show stripe checkout in the frontend
    res.send({
        clientSecret: paymentIntent.client_secret,
        //total cart
        cartTotal,
        //discount value
        totalAfterDiscount,
        //to pay
        payable: finalAmount
    })
}