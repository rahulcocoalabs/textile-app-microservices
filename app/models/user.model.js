const mongoose = require('mongoose');


const user = mongoose.Schema({
	name: String,
	email: String,
	mobile: String,
	image: String,
	passwordHash: String,
	wishlist: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
	}],
	isBlocked: Boolean,
	status: Number,
	tSCreatedAt: Number,
	tSModifiedAt: Number

})
module.exports = mongoose.model('User', user, "Users");