const auth = require('../middleware/adminAuth.js');
var config = require('../../config/app.config.js');
var multer = require('multer');
var mime = require('mime-types');
var offerConfig = config.offers;


var storage = multer.diskStorage({
    destination: offerConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var ImageUpload = multer({ storage: storage });
module.exports = (app) => { 
    const admin = require('../controllers/admin.controller');
    
    app.post('/admin/create',admin.create);
    app.post('/admin/login',admin.login);
    app.post('/admin/add',admin.addUser);

    //offers
    app.post('/admin/addoffer',auth,ImageUpload.single('image'),admin.addOffer);
    app.patch('/admin/:id/updateoffer',auth,admin.updateOffer);
    app.delete('/admin/:id/removeoffer',auth,admin.deleteOffer);
    
    app.get('/admin/offerlist',auth,admin.listOffers)
    
    app.patch('/admin/:id/addproductsoffer',auth,admin.updateOfferToProducts);
}