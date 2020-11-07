const mongoose = require('mongoose');


const colors = mongoose.Schema({
    name:String,
    value:String,
    productId:{
        type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
    },
    image:String,
    status: Number,
    tsCreatedAt: Number,
	tsModifiedAt: Number
});
module.exports = mongoose.model('Color', colors, "Colors");