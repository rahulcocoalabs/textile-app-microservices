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

const product = mongoose.Schema({
	name: String,
	description: String,
	quantity: Number,
	brand: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Brand'
	},
	mainImage:String,
	image: [String],
	subImages: Array,
	offerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Offer'
	},
	costPrice: Number,
	sellingPrice:Number,
	variantExists: Boolean,
	isFavourite:Boolean,
	isTrending:Boolean,
	isPopular:Boolean,
	variants:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Variant'
	}],
	categories:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category'
	}],
	colors:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Color'
	}],
	sizes:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Size'
	}],
	upperSellingPrice:Number,
	lowerSellingPrice:Number,
	discount: Number,
	sku: String,
	weight: Number,
	height: Number,
	width: Number,
	length: Number,
	currency: String,
	isActive: Boolean,
	isBuyable: Boolean,
	isShippable: Boolean,
	stockAvailable: Number,
	outOfStock: Boolean,
	averageRating: Number,
	isVegOnly: Boolean,
	isCombo: Boolean,
	status: Number,
	tsCreatedAt: Number,
	tsModifiedAt: Number,
}, options);

module.exports = mongoose.model('Product', product, "Products");