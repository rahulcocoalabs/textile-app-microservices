const mongoose = require('mongoose');


const vendor = mongoose.Schema(
    {
                 status:Number,
                 name:String,
				 email:String,
				 mobile:String,
				 passwordHash:String,
				 delivery_agents:[String],
				 tSCreatedAt:Number,
				 tSModifiedAt:Number
        
    }
)
module.exports = mongoose.model('Vendor',vendor,"Vendors");