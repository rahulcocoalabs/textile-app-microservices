const mongoose = require('mongoose');


const colors = mongoose.Schema({
    name:String,
    value:String,
    status: Number,
    tsCreatedAt: Number,
	tsModifiedAt: Number
});
module.exports = mongoose.model('Color', colors, "Colors");