const Subcategory = require('../models/subcategory-model')
const Product = require('../models/product-model')
//So we can create slugs
const slugify = require('slugify')

exports.create = async (req, res) => {
    try {
        //Potrebno nam je samo name, a koristit cemo slugify da kreiramo slug na osnovu name
        const { name, parent } = req.body
        const category = await new Subcategory({ name, parent, slug: slugify(name) }).save()
        //podefaultu imamo status code 200
        console.log('category', category)
        res.json(category)
    } catch (e) {
        res.status(400).send('Create subcategory failed')
    }
}

exports.list = async (req, res) => {
    //Sort by latest created category
    res.json(await Subcategory.find({}).sort({ createdAt: -1 }).exec())
}

exports.read = async (req, res) => {
    //Find by slug
    //exec koristimo da izvrsimo 
    //ako ne koristimo async/await onda koristimo callback funkciju unutar exec, ako koristimo async onda mozemo samo pozvati exec()
    const subcategory = await Subcategory.findOne({ slug: req.params.slug }).exec()
    //Find all products based on subcategories
    const products = await Product.find({ subcategories: subcategory })
        .populate('category')
        .exec()
    res.json({
        subcategory,
        products
    })
}

exports.update = async (req, res) => {
    const { name, parent } = req.body

    try {
        //first argument. find by slug, second argument update name and slug
        const updated = await Subcategory.findOneAndUpdate(
            { slug: req.params.slug },
            { name, parent, slug: slugify(name) },
            { new: true })
        res.json(updated)
    } catch (e) {
        res.status(400).send("Subcategory update failed")
    }
}

exports.remove = async (req, res) => {
    try {
        const deleted = await Subcategory.findOneAndDelete({ slug: req.params.slug })
        if (!deleted) {
            res.status(400).json('Unable to find category:' + req.params.slug)
            return
        }
        res.json(deleted)
    } catch (e) {
        res.status(400).send("Subcategory delete failed")
    }
}