const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { ObjectId } = mongoose.Schema

const orderSchema = mongoose.Schema({
    products: [
        {
            product: {
                type: ObjectId,
                ref: "Product",
            },
            count: Number,
            color: String,
        }
    ],
    paymentIntent: {},
    orderStatus: {
        type: String,
        default: 'Not processed',
        enum: [
            'Not processed',
            'Cash On Delivery',
            'Processing',
            'Dispatched',
            'Cancelled',
            'Completed'
        ]
    },
    orderdBy: {
        type: ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

module.exports = mongoose.model('Order', orderSchema)