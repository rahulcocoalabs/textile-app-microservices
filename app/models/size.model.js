const mongoose = require('mongoose');


const size = mongoose.Schema({
    name:String,
    value:String,
    status: Number,
    tsCreatedAt: Number,
	tsModifiedAt: Number
});
module.exports = mongoose.model('Size', size, "Sizes");