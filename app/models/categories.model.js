const mongoose = require('mongoose');

function transform(ret) {
	delete ret.status;
	delete ret.tSCreatedAt;
	delete ret.tSModifiedAt;
}
var options = {
	toObject: {
		virtuals: true,
		transform: function (doc, ret) {
			transform(ret);
		}
	},
	toJSON: {
		virtuals: true,
		transform: function (doc, ret) {
			transform(ret);
		}
	}
};

const category = mongoose.Schema({
	name: String,
	image: String,
	status: Number,
	tsCreatedAt: Number,
	tsModifiedAt: Number

}, options)
module.exports = mongoose.model('Category', category, 'Categories');