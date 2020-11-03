const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({   
    name: String,
    image:String,
    status: Number,
    tSCreatedAt: Number,
    tSModifiedAt: Number
});
module.exports = mongoose.model('Brand', brandSchema, "Brands");