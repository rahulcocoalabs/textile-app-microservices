const mongoose = require('mongoose');


const offer = mongoose.Schema({
    description: String,
    offerId:String,
    value:Number,
    image:String,
    productsAssigned:[
        {
             type: mongoose.Schema.Types.ObjectId, ref: 'Product'
        }
    ],
    status: Number,
    tSCreatedAt: Number,
    tSModifiedAt: Number

})
module.exports = mongoose.model('Offer', offer, "Offers");