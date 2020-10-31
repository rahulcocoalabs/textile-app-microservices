const mongoose = require('mongoose');

function transform(ret) {
	ret.id = ret._id;
	delete ret._id;
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

const review = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  rating: Number,
  status: Number,
  tsCreatedAt: Number,
  tsModifiedAt: Number

})
module.exports = mongoose.model('Review', review, "Reviews");