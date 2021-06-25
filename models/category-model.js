const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
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
    }
}, {timestamps: true})

module.exports = mongoose.model('Category', categorySchema)