const User = require('../models/user-model')
const Product = require('../models/product-model')
const Cart = require('../models/cart-model')
const Coupon = require('../models/coupon-model')
const Order = require('../models/order-model')
const uniqueid = require('uniqueid')

//Save cart to database
exports.userCart = async (req, res) => {
    const { cart } = req.body

    let products = []

    //Find who is logged in user
    const user = await User.findOne({ email: req.user.email }).exec()

    //Check if cart with logged in user id already exists
    //Get cart from database
    let cartExistsByThisUser = await Cart.findOne({ orderdBy: user._id }).exec()

    //Logged in user will always have only one cart
    //U slucaju da user zeli da update cart stari pobrisemo a novi dodamo
    if (cartExistsByThisUser) {
        //Mongoose remove method
        //Remove so we don't have previous carts
        cartExistsByThisUser.remove()
    }

    //Save new Cart for this user
    for (let i = 0; i < cart.length; i++) {
        let object = {}

        //Add properties to object, data from frontend
        object.product = cart[i]._id
        //number of products, data from frontend
        object.count = cart[i].count
        //color of product, data from frontend
        object.color = cart[i].color
        //Get price for creating total, data from backend
        let productFromDb = await Product.findById(cart[i]._id).select('price').exec()
        object.price = productFromDb.price

        products.push(object)
    }
    let cartTotal = 0
    for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count
    }
    // console.log('cartTotal', cartTotal)
    let newCart = await new Cart({
        products,
        cartTotal,
        orderdBy: user._id
    }).save()
    console.log("new cart ----> ", newCart);
    //in frontend we wait response to be ok
    res.json({ ok: true })
}

exports.getUserCart = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).exec();

        console.log('user', user)

        let cart = await Cart.findOne({ orderdBy: user._id })
            .populate("products.product", "_id title price totalAfterDiscount")
            .exec();

        console.log('cart', cart)

        const { products, cartTotal, totalAfterDiscount } = cart
        console.log('products ->', products)
        res.json({
            products,
            cartTotal,
            totalAfterDiscount
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "error" })
    }
}

exports.emptyCart = async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).exec()

    const cart = await Cart.findOneAndRemove({ orderdBy: user._id }).exec()

    res.json(cart)
}

exports.saveAddress = async (req, res) => {
    //Find by email and update address
    const userAddress = await User.findOneAndUpdate(
        { email: req.user.email },
        { address: req.body.address }
    ).exec()
    res.json({ ok: true })
}

exports.applyCouponToUserCart = async (req, res) => {
    const { coupon } = req.body
    console.log('coupon', coupon)

    //Check if coupon is valid
    const validCoupon = await Coupon.findOne({ name: coupon }).exec()
    //ako nismo pronasli coupon vrati nam null
    if (validCoupon === null) {
        return res.json({
            err: 'Invalid Coupon'
        })
    }
    console.log('Valid coupon', validCoupon)
    //Logged in user
    const user = await User.findOne({ email: req.user.email }).exec()

    let { products, cartTotal } = await Cart.findOne({ orderdBy: user._id })
        .populate('products.product', '_id title price')
        .exec()

    console.log('cartTotal', cartTotal, 'discount', validCoupon.discount)
    //calculate total after discount
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2)

    //Update users Cart
    Cart.findOneAndUpdate(
        { orderdBy: user._id },
        { totalAfterDiscount },
        { new: true }
    ).exec()
    //Send only amount after discount
    res.json(totalAfterDiscount)
}

//stripe
exports.createOrder = async (req, res) => {
    const { paymentIntent } = req.body.stripeResponse
    const user = await User.findOne({ email: req.user.email }).exec()

    //All orders of user
    let { products } = await Cart.findOne({ orderdBy: user._id }).exec()
    //Create new order
    let newOrder = await new Order({
        products,
        paymentIntent,
        orderdBy: user._id
    }).save()

    //decrement quantity, increment sold
    let bulkOption = products.map(p => {
        return {
            updateOne: {
                filter: { _id: p.product._id },
                //decrement quantity, increment sold
                update: { $inc: { quantity: -p.count, sold: +p.count } }
            }
        }
    })

    let updated = await Product.bulkWrite(bulkOption, {})

    console.log('PRODUCT QUANTITY DECREMENTED AND SOLD INCREMENTED', updated)

    //of ok is true then empty cart
    res.json({ ok: true })
}

exports.orders = async (req, res) => {
    let user = await User.findOne({ email: req.user.email }).exec()

    let userOrders = await Order.find({ orderdBy: user._id })
        //Ako ne bi koristili populate('products.product') dobili bi nazad samo id od produkta?
        .populate('products.product')
        .exec()
    console.log(userOrders[0].products)
    res.json(userOrders)
}

//Wishlist 
exports.addToWishlist = async (req, res) => {
    console.log(req.body)
    const { productId } = req.body
    //$addToSet add only one product if user click multiple times on same product, so we want to prevent duplicates in wishlist
    const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { $addToSet: { wishlist: productId } }
    )
    res.json({ ok: true })
}
exports.wishlist = async (req, res) => {
    const list = await User.findOne({ email: req.user.email })
        .select("wishlist")
        .populate("wishlist")
        .exec();

    console.log('list', list)

    res.json(list);
}
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params
    //$pull Delete from wishlist method
    const user = await User.findOneAndUpdate({ email: req.user.email }, { $pull: { wishlist: productId } }).exec()

    res.json({ ok: true })
}

//Pay on Cash delivery
exports.createCashOrder = async (req, res) => {
    const { COD, couponApplied } = req.body

    if (!COD) {
        return res.status(400).send('Create Cash Order Failed')
    }

    //If COD is true, create order with status of Cash On Delivery
    const user = await User.findOne({ email: req.user.email }).exec()

    //All orders of user
    let userCart = await Cart.findOne({ orderdBy: user._id }).exec()

    let finalAmount = 0

    //if coupon is applied and have totalAfterDiscount calculate discount
    if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount * 100 //multiply with 100 cents
    } else {
        finalAmount = userCart.cartTotal * 100 //multiply with 100 cents
    }

    //Create new order
    let newOrder = await new Order({
        products: userCart.products,
        //Create payment intent, so we don't have errors in frontent, when user go to history to check purchased products
        //Only data we need in http://localhost:3000/user/history
        paymentIntent: {
            id: uniqueid(),
            amount: finalAmount,
            currency: "usd",
            status: "Cash On Delivery",
            created: Date.now(),
            payment_method_types: ['Cash']
        },
        orderdBy: user._id,
        orderStatus: "Cash On Delivery"
    }).save()

    //decrement quantity, increment sold
    let bulkOption = userCart.products.map(p => {
        return {
            updateOne: {
                filter: { _id: p.product._id },
                //decrement quantity, increment sold
                update: { $inc: { quantity: -p.count, sold: +p.count } }
            }
        }
    })

    let updated = await Product.bulkWrite(bulkOption, {})

    //console.log('PRODUCT QUANTITY DECREMENTED AND SOLD INCREMENTED', updated)

    //of ok is true then empty cart
    res.json({ ok: true })
}