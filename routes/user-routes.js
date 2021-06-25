const express = require("express");

const router = express.Router();

//** middlewares **
const { authCheck } = require('../middleware/auth')
const { 
    userCart, 
    getUserCart,
    emptyCart, 
    saveAddress, 
    applyCouponToUserCart, 
    createOrder,
    orders,
    addToWishlist,
    wishlist,
    removeFromWishlist,
    createCashOrder
 } = require('../controllers/user-controllers')

router.post("/user/cart", authCheck, userCart)
router.get("/user/cart", authCheck, getUserCart)
router.delete("/user/cart", authCheck, emptyCart)
router.post("/user/address", authCheck, saveAddress)

router.post("/user/order", authCheck, createOrder) //stripe
router.post("/user/cash-order", authCheck, createCashOrder) //cash on delivery
router.get("/user/orders", authCheck, orders)

//coupon
router.post('/user/cart/coupon', authCheck, applyCouponToUserCart)

//Wishlist
//Add wishlist
router.post('/user/wishlist', authCheck, addToWishlist)
//Get wishlists
router.get('/user/wishlist/', authCheck, wishlist)
//Delete item from wishlist
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist)


module.exports = router;
