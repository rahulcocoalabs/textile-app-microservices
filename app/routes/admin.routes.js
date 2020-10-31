const auth = require('../middleware/auth.js');
module.exports = (app) => { 
    const admin = require('../controllers/admin.controller');
    
    app.post('/admin/create',admin.create);
    app.post('/admin/login',admin.login);
    app.post('/admin/add',admin.addUser);
}