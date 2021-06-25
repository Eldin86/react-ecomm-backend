const Category = require('../models/category-model')
const Subcategory = require('../models/subcategory-model')
const Product = require('../models/product-model')
//So we can create slugs
const slugify = require('slugify')

exports.create = async (req, res) => {
    try{
        //Potrebno nam je samo name, a koristit cemo slugify da kreiramo slug na osnovu name
        const {name} =  req.body
        console.log(name)
        const category = await new Category({name, slug: slugify(name)}).save()
        //podefaultu imamo status code 200
        res.json(category)
    }catch(e) {
        res.status(400).send('Create category failed')
    }
}

exports.list = async (req, res) => {
    //Sort by latest created category
    res.json(await Category.find({}).sort({createdAt: -1}).exec())
}

exports.read = async (req, res) => {
    //Find by slug
    //exec koristimo da izvrsimo 
    //ako ne koristimo async/await onda koristimo callback funkciju unutar exec, ako koristimo async onda mozemo samo pozvati exec()
    const category = await Category.findOne({slug: req.params.slug}).exec()
    //console.log('category controller -> category', category)
    //res.json(category)
    //Find product based on category
    const products = await Product.find({category})
        .populate('category')
        .exec()
        console.log('category controller -> products', products)
    res.json({
        category,
        products
    })
}

exports.update = async (req, res) => {
    const {name} = req.body

    try{
        //first argument. find by slug, second argument update name and slug
        const updated = await Category.findOneAndUpdate(
            {slug: req.params.slug}, 
            {name, slug: slugify(name)}, 
            {new: true})
            res.json(updated)
    }catch(e){
        res.status(400).send("Category update failed")
    }
}

exports.remove = async (req, res) => {
    try{
        const deleted = await Category.findOneAndDelete({slug: req.params.slug})
        if(!deleted){
            res.status(400).json('Unable to find category:' + req.params.slug)
            return 
        }
        res.json(deleted)
    }catch(e){
        res.status(400).send("Category delete failed")
    }
}
//koristenje promises bez async
exports.getSubcategories = async (req, res) => {
    //find based on parent, we only send parent _id
    Subcategory.find({parent: req.params._id}).exec((err, subcategories) => {
        if(err) console.log(err)
        res.json(subcategories)
    })
}