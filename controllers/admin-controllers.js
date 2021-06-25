const Order = require('../models/order-model')

exports.orders = async(req, res) => {
    console.log('radi')
    let orders = await Order.find({})
        .sort('-createdAt')
        .populate('products.product')
        .exec()

    res.json(orders)
}

exports.orderStatus = async(req, res) => {
    //order status we get from frontend and it represents enum values from model in backend
    const {orderId, orderStatus} = req.body
    let updated = await Order.findByIdAndUpdate(orderId, {orderStatus}, {new: true}).exec()

    res.json(updated)
}