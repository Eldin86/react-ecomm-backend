const express = require("express");
const router = express.Router();

//** middlewares **
const { authCheck, adminCheck } = require('../middleware/auth')

//** imports**
const {
    create,
    read, 
    update,
    remove,
    list,
    getSubcategories
} = require('../controllers/category-controllers')

//routes
router.post('/category', authCheck, adminCheck, create)
router.get('/categories', list)
router.get('/category/:slug', read)
router.put('/category/:slug', authCheck, adminCheck, update)
router.delete('/category/:slug', authCheck, adminCheck, remove)
//Fetch subcategorie based on parent categorie
router.get('/category/subcategories/:_id', getSubcategories)

module.exports = router;
