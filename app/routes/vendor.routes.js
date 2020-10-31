const auth = require('../middleware/auth.js');
module.exports = (app) => { 
    const vendor = require('../controllers/vendor.controller');

    app.post('/vendor/create',vendor.create);
    app.post('/vendor/login',vendor.login);
    app.post('/vendor/add_devivery_agent',auth,vendor.add_devivery_agent);
    app.get('/vendor/profile',auth, vendor.show);
    

}