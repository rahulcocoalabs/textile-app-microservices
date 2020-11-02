const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({   
    name: String,
    image:String,
    status: Number,
    tSCreatedAt: Number,
    tSModifiedAt: Number
});
module.exports = mongoose.model('Banner', bannerSchema, "Banners");