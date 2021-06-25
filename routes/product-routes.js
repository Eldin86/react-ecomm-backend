const express = require("express");
const router = express.Router();

//** middlewares **
const { authCheck, adminCheck } = require('../middleware/auth')

//** imports**
const { 
    create, 
    listAll, 
    remove, 
    read, 
    update, 
    list, 
    productCount, 
    productStar, 
    listRelated,
    searchFilters } = require('../controllers/product-controllers')

//**routes**
router.post('/product', authCheck, adminCheck, create)
//To ge tnumber of documents
router.get('/products/total', productCount)
router.get('/products/:count', listAll)
router.delete('/product/:slug', authCheck, adminCheck, remove)
router.get('/product/:slug', read)
router.put('/product/:slug', authCheck, adminCheck, update)
//post koristimo jer je lahko da posaljemo data u req.body, jer cemo slati neke data kao sto su sorting, tako da mozemo sortirati u zavisnosti asc ili desc, limit, quantity
router.post('/products', list)
//kreiramo endpoint da bismo dohvatili request da dodamo rating productu
//rating
router.put('/product/star/:productId', authCheck, productStar)

//related products
router.get("/product/related/:productId", listRelated)
//Search 
//koristimo post jer je sa njim lakse poslati dodatne parametre
//kreiramo jedan endpoint za sve search query
router.post('/search/filters', searchFilters)

module.exports = router;
