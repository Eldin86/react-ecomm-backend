const Product = require('../models/product-model')
const User = require('../models/user-model')
const slugify = require('slugify')

exports.create = async (req, res) => {
    try {
        //spremimo u req.body objekat slug koji smo kreirali pomocu slugify metode koja prima title
        req.body.slug = slugify(req.body.title)
        const newProduct = await new Product(req.body).save()
        console.log(newProduct)
        res.json(newProduct)
    } catch (e) {
        //res.status(400).send('Create product failed.')
        res.status(400).json({
            //error mora da bude isti na frontendu kao ovaj na backendu. (error)
            error: e.message
        })
    }
}

exports.listAll = async (req, res) => {
    //populate dobijemo category id, created_at, updated_at ...etc
    //let products = await Product.find({}).populate(('category'))
    let products = await Product.find({})
        .limit(parseInt(req.params.count))
        //Da bismo koristili populate moramo da imamo u modelu refs na odredjenu kategoriju
        //ako ne bismo koristili populate, samo bismo dobili id od category i subcategory, na ovaj nacin dobijemo sve podatke
        .populate('category')
        .populate('subcategories')
        .sort([['createdAt', 'desc']])
        .exec()
        console.log('products.length', products.length)

    res.status(200).json(products)
}

exports.remove = async (req, res) => {
    try {
        console.log(req.params.slug)
        const deletedProduct = await Product.findOneAndRemove({ slug: req.params.slug }).exec()
        res.json(deletedProduct)
    } catch (e) {
        console.log(e)
        return res.status(400).send('Product delete failed')
    }
}
//Get single product
exports.read = async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate('category')
        .populate('subcategories')
        .exec()
    console.log(product)
    res.json(product)
}

exports.update = async (req, res) => {
    try {
        //If we want to update slug
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        //If we don't want to update slug
        //So we can return updated data with {new: true}
        const updated = await Product.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true }).exec()
        console.log('updated', updated)
        res.json(updated)
    } catch (e) {
        console.log('Product Update Error', e)
        res.status(400).json({
            //error mora da bude isti na frontendu kao ovaj na backendu. (error)
            error: e.message
        })
    }
}

//Without pagination
// exports.list = async (req, res) => {
//     try {
//         //query products from database da bismo dohvatili sve i aplicirali soritanje
//         //createdAt/updatedAt, desc/asc, limit (3)
//         const { sort, order, limit } = req.body

//         const products = await Product.find({})
//             .populate('category')
//             //To have it in the global state so we don't have to request again for it's subs categories. If you don't you have to first take the id then make a separate request to your server.
//             .populate('subcategories')
//             .sort([[sort, order]])
//             .sort()
//             .limit(limit)
//             .exec()

//         res.json(products)
//     } catch (e) {
//         console.log(e)
//     }
// }

//With pagination
//New arrivals section
exports.list = async (req, res) => {
    console.table(req.body)
    try {
        const { sort, order, page } = req.body
        //If we don't get page number from request then default is 1
        const currentPage = page || 1
        //How many products we want to return per page
        const perPage = 3

        const products = await Product.find({})
            //Skip (number) of products
            .skip((currentPage - 1) * perPage)
            .populate('category')
            //To have it in the global state so we don't have to request again for it's subs categories. If you don't you have to first take the id then make a separate request to your server.
            .populate('subcategories')
            .sort([[sort, order]])
            .sort()
            .limit(perPage)
            .exec()

        res.json(products)
    } catch (e) {
        console.log(e)
    }
}

//Get number of documents
exports.productCount = async (req, res) => {
    /*The estimatedDocumentCount() function is quick as it estimates the number of documents in the 
    MongoDB collection. It is used for large collections because this function uses collection 
    metadata rather than scanning the entire collection.*/
    let total = await Product.find({}).estimatedDocumentCount().exec()
    console.log('total', total)
    res.json(total)
}

//Add/Update product
exports.productStar = async (req, res) => {
    //First find product by id to add or update rating
    const product = await Product.findById(req.params.productId).exec()
    //Find user by email if logged in, because only logged in user can add rating
    const user = await User.findOne({ email: req.user.email }).exec()
    //Number of stars, 1, 2, 3, 4, 5
    const { star } = req.body

    //who is updating

    //check if currently logged in user have already added rating to this product?
    //Check if user already added rating to product then update else add rating
    let existingRatingObject = product.ratings.find((element) => (element.postedBy.toString() === user._id.toString()))

    //If user haven't left rating yet push it 
    if (existingRatingObject === undefined) {
        //Find product By Id
        let ratingAdded = await Product.findByIdAndUpdate(product._id, {
            //mongoose method to push, into ratings, and push star and postedBy
            $push: { ratings: { star: star, postedBy: user._id } }
            //{new: true} => Return updated object
        }, { new: true }).exec()
        console.log('ratingAdded', ratingAdded)
        res.json(ratingAdded)
    } else {
        //if user have already left rating, update it
        const ratingUpdated = await Product.updateOne(
            //Find particular rating to update
            {
                ratings: { $elemMatch: existingRatingObject }
            },
            //we only need to update star, because existing user is already saved in database
            //In ratings array find star and update value
            {
                $set: { "ratings.$.star": star }
            },
            { new: true }
        ).exec()
        console.log('ratingUpdated', ratingUpdated)
        res.json(ratingUpdated)
    }

}
//List Related Products
exports.listRelated = async (req, res) => {
    //Find product by route parameter
    const product = await Product.findById(req.params.productId).exec()

    //Find related product that shares same category with excluded current one
    const related = await Product.find({
        //$ne means not included
        _id: { $ne: product._id },
        //based on category, category will be product.category
        category: product.category
    })
        .limit(3)
        .populate('category')
        .populate('subcategory')
        //Populate only _id and name
        //.populate('postedBy', '_id name')
        .populate('postedBy')
        .exec()

    res.json(related)
}

//SEARCH/FILTER
const queryHandler = async (req, res, query) => {
    //Find by text query, in product-model we have text property in title and description, so we can search in title and description while we search
    //text based search
    //https://docs.mongodb.com/manual/text-search/
    const products = await Product.find({ $text: { $search: query } })
        .populate('category', '_id name')
        .populate('subcategory', '_id name')
        .populate('postedBy', '_id name')
        .exec()
    res.json(products)
}

//Price range filter
const priceHandler = async (req, res, price) => {
    try {
        let products = await Product.find({
            price: {
                //Great than 
                //selects the documents where the value of the field is greater than or equal to (i.e. >=) a specified value (e.g. value.)
                $gte: price[0],
                //Less than
                // selects the documents where the value of the field is less than or equal to (i.e. <=) the specified value.
                $lte: price[1]
            }
        })
            .populate('category', '_id name')
            .populate('subcategory', '_id name')
            .populate('postedBy', '_id name')
            .exec()
        res.json(products)
    } catch (e) {
        console.log(e)
    }
}

//Category filter
const categoryHandler = async (req, res, category) => {
    try {
        const products = await Product.find({ category })
            .populate('category', '_id name')
            .populate('subcategory', '_id name')
            .populate('postedBy', '_id name')
            .exec()
        res.json(products)
    } catch (e) {
        console.log(e)
    }
}

//Rating filter
//kad koristimo exec ne treba nam async/await
const starHandler = (req, res, stars) => {
    Product.aggregate([
        {
            $project: {
                //With $$ROOT we can get entire document
                document: "$$ROOT",
                floorAverage: {
                    //eg. if average is 3.33 floor is 3 stars
                    $floor: {
                        $avg: "$ratings.star"
                    }
                }
            }
        },
        //Match with floorAverage value
        { $match: { floorAverage: stars } }
    ])
        .limit(12)
        .exec((err, aggregates) => {
            if (err) console.log("AGREGATE ERROR", err)

            Product.find({ _id: aggregates })
                .populate('category', '_id name')
                .populate('subcategory', '_id name')
                .populate('postedBy', '_id name')
                .exec((err, products) => {
                    if (err) console.log('PRODUCT AGGREGATE ERROR', err)

                    res.json(products)
                })
        })
}

//Subcategory filter
const subcategoryHandler = async (req, res, subcategory) => {
    const products = await Product.find({ subcategories: subcategory })
        .populate('category', '_id name')
        .populate('subcategory', '_id name')
        .populate('postedBy', '_id name')
        .exec()

    return res.json(products)
}

//Shipping filter
const shippingHandler = async (req, res, shipping) => {
    const products = await Product.find({ shipping })
        .populate('category', '_id name')
        .populate('subcategory', '_id name')
        .populate('postedBy', '_id name')
        .exec()

    res.json(products)
}
//Color filter
const colorHandler = async (req, res, color) => {
    const products = await Product.find({ color })
        .populate('category', '_id name')
        .populate('subcategory', '_id name')
        .populate('postedBy', '_id name')
        .exec()

    res.json(products)
}
//Brand filter
const brandHandler = async (req, res, brand) => {
    const products = await Product.find({ brand })
        .populate('category', '_id name')
        .populate('subcategory', '_id name')
        .populate('postedBy', '_id name')
        .exec()
    console.log('products', products)
    res.json(products)
}

exports.searchFilters = async (req, res) => {
    //search text, radio button, price range... etc, different types of query
    const {
        query,
        price,
        category,
        stars,
        subcategory,
        shipping,
        color,
        brand } = req.body
    //filter by search query
    if (query) {
        console.log('query', query)
        await queryHandler(req, res, query)
    }
    //Filter by price range, price will be array [10, 100] eg.
    if (price !== undefined) {
        console.log('price', price)
        await priceHandler(req, res, price)
    }

    if (category) {
        console.log('category', category)
        await categoryHandler(req, res, category)
    }

    if (stars) {
        console.log('stars', stars)
        await starHandler(req, res, stars)
    }

    if (subcategory) {
        console.log('subcategory', subcategory)
        await subcategoryHandler(req, res, subcategory)
    }

    if (shipping) {
        console.log('shipping', shipping)
        await shippingHandler(req, res, shipping)
    }

    if (color) {
        console.log('color', color)
        await colorHandler(req, res, color)
    }

    if (brand) {
        console.log('brand', brand)
        await brandHandler(req, res, brand)
    }
}