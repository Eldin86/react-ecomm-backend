const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        //kasnije kad trazili DB koristeci title, mozemo koristiti text
        text: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        //index da mozemo query na osnovu sluga
        index: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,
        text: true
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        maxlength: 32
    },
    category: {
        type: ObjectId,
        ref: 'Category',
    },
    subcategories: [{
        type: ObjectId,
        ref: 'Subcategory'
    }],
    quantity: Number,
    sold: {
        type: Number,
        default: 0
    },
    images: {
        type: Array
    },
    shipping: {
        type: String,
        //Unaprijed definisane vrijednosti
        enum: ['Yes', 'No']
    },
    color: {
        type: String,
        enum: ["Black", "Brown", "Silver", "White", "Blue"]
    },
    brand: {
        type: String,
        enum: ["Apple", "Samsung", "Microsoft", "Lenovo", "ASUS", "DELL", "ACER"]
    },
    //svaki produkt ce imati niz ratings-a
    ratings: [
        {
            star: Number,
            postedBy: {type: ObjectId, ref: "User"}
        }
    ]
}, {timestamps: true})

module.exports = mongoose.model('Product', productSchema)