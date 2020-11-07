const auth = require('../middleware/adminAuth.js');
var config = require('../../config/app.config.js');
var multer = require('multer');
var mime = require('mime-types');
var productsConfig = config.products;
var colorsConfig = config.products;

var storage = multer.diskStorage({
    destination: productsConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var storage1 = multer.diskStorage({
    destination: colorsConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var ImageUpload = multer({ storage: storage });
var ImageUpload1 = multer({ storage: storage1 });
module.exports = (app) => {
    const products = require('../controllers/adminProducts.controller');
    
  
    app.post('/adminProducts/create', ImageUpload.fields([{name:'images'}]), products.create);
    app.get('/adminProducts/search', auth, products.search);
    app.patch('/adminProducts/:id/update', auth, products.update);
    app.delete('/adminProducts/:id/delete', auth, products.delete);

    app.post('/adminproducts/addvariant', auth, products.addVariant);
    app.get('/adminProducts/variant/:id/detail', auth, products.getVariantDetail);
    app.patch('/adminProducts/variant/:id/update', auth, products.updateVariant);
    app.delete('/adminProducts/variant/:id/delete', auth, products.deleteVariant);
    app.get('/adminProducts/:id/variant/list', auth, products.listVariants);

    app.post('/adminProducts/createsize', auth, products.createSize);
    app.post('/adminProducts/createcolor', auth, ImageUpload.single('image'),products.createColor);
}