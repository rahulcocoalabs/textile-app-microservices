const auth = require('../middleware/adminAuth.js');
var config = require('../../config/app.config.js');
var multer = require('multer');
var mime = require('mime-types');
var brandConfig = config.brands;


var storage = multer.diskStorage({
    destination: brandConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var ImageUpload = multer({ storage: storage });
module.exports = (app) => {
    const brands = require('../controllers/brands.controller');
    
  
    app.post('/brands/create', ImageUpload.single('image'), brands.create);
    app.get('/brands/list', auth, brands.list);

}