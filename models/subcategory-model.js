const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trime: true,
        required: 'Name is required',
        //Minimum 3 chars long, else send message too short, same for maxLength
        minLength: [2, 'Too short'],
        maxLength: [32, 'Too long']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        //we use index for query database to fetch particular category based on slug
        index: true
    },
    //subkategorija mora da ima jedan parent, referiramo se na parent category po parent category model name
    parent: {
        //Id od parenta, tj Category, u ovisnosti koji izaberemo, taj ce biti vezan za kategoriju
        type: ObjectId,
        ref: "Category",
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Subcategory', subcategorySchema)