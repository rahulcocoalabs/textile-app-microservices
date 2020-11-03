const auth = require('../middleware/auth.js');

module.exports = (app) => { 
    const product = require('../controllers/product.controller');
    app.get('/product', auth, product.list);
    app.get('/product/:id/detail',auth, product.detail);
    app.get('/product/list',auth, product.list);
    app.get('/product/home',auth, product.home);
}