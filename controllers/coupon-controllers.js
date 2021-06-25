const Coupon = require('../models/coupon-model')

//Create, remove, list
exports.create = async (req, res) => {
    try {
        const { name, expiry, discount } = req.body.coupon
        res.json(await new Coupon({ name, expiry, discount }).save())
    } catch (error) {
        console.log(error)
    }
}
exports.remove = async (req, res) => {
    console.log(req.params.couponId)
    try {
        res.json(await Coupon.findByIdAndRemove(req.params.couponId).exec())
    } catch (error) {
        console.log(error)
    }
}
exports.list = async (req, res) => {
    try {
        //desc order -1
        res.json(await Coupon.find({}).sort({ createdAt: -1 }))
    } catch (error) {
        console.log(error)
    }
}
