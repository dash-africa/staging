'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

var _controllers = require('../controllers');

var _controllers2 = _interopRequireDefault(_controllers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = (0, _express2.default)();

function verifyToken(req, res, next) {
    // GET THE AUTH HEADER VALUE
    var bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        _jsonwebtoken2.default.verify(bearerHeader, process.env.SECRET_KEY, function (err, data) {
            _models2.default.User.findById(data.user).then(function (user) {
                if (user) {
                    req.user = data.user;
                    next();
                } else {
                    res.status(403).json({ status: false, message: 'Unauthorized' });
                }
            }).catch(function (err) {
                if (err) {
                    res.status(403).json({ status: false, message: 'Unauthorized' });
                }
            });
        });
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}

routes.get('/', function (req, res) {
    res.json({ status: true });
});

// admin routes
routes.post('/admin/login', _controllers2.default.adminController.login);
routes.post('/admin/register', _controllers2.default.adminController.register);

// user routes
routes.post('/user/login', _controllers2.default.userController.loginUser);
routes.post('/user/register', _controllers2.default.userController.registerUser);
routes.post('/confirmation', _controllers2.default.userController.confirmationPost);
routes.post('/resend', _controllers2.default.userController.resendTokenPost);
routes.post('/sendForget', _controllers2.default.userController.resendForgottenToken);
routes.post('/forgot_password', _controllers2.default.userController.changePassword);
routes.post('/sendOtp', verifyToken, _controllers2.default.userController.sendOtpToPhone);
routes.post('/verifyPhoneNumber', verifyToken, _controllers2.default.userController.verifyPhoneNumber);
routes.get('/user/all', _controllers2.default.userController.getAllUsers);
routes.post('/user/getInfo', verifyToken, _controllers2.default.userController.getUserInfo);
routes.get('/user/fetchCart', verifyToken, _controllers2.default.userController.fetchUserCart);

// Cart Routes
routes.post('/cart/create', verifyToken, _controllers2.default.cartController.createCart);
routes.get('/cart/getCart/:id', _controllers2.default.cartController.fetchCart);
routes.post('/cart/addItem', _controllers2.default.cartController.addItems);

// Category Routes
routes.post('/category/create', _controllers2.default.categoryController.createCategory);
routes.post('/category/addItem', _controllers2.default.categoryController.addItem);
routes.get('/category/all', _controllers2.default.categoryController.allCategories);
routes.put('/category/edit', _controllers2.default.categoryController.editCategory);
routes.delete('/category/delete/:id', _controllers2.default.categoryController.deleteCategory);
routes.post('/category/removeItem', _controllers2.default.categoryController.removeItem);

// City Routes
routes.post('/city/create', _controllers2.default.cityControler.createCity);
routes.post('/city/addStore', _controllers2.default.cityControler.addStore);
routes.get('/city/all', _controllers2.default.cityControler.allCities);
routes.post('/city/removeStore', _controllers2.default.cityControler.removeStore);
routes.put('/city/edit', _controllers2.default.cityControler.editCity);
routes.delete('/city/delete/:id', _controllers2.default.cityControler.deleteCity);
routes.get('/city/stores/:cityId', _controllers2.default.cityControler.fetchCity);
routes.get('/city/topCategories/:cityId', _controllers2.default.cityControler.getAllTopCategories);

// Item Routes
routes.post('/item/create', _controllers2.default.itemController.create);
routes.post('/item/addToCart', _controllers2.default.itemController.addToCart);
routes.post('/item/addAddOn', _controllers2.default.itemController.addAddOn);
routes.post('/item/removeAddOn', _controllers2.default.itemController.removeAddOn);
routes.get('/item/getItem/:itemId', _controllers2.default.itemController.fetchItem);
routes.get('/item/all', _controllers2.default.itemController.getAll);
routes.put('/item/edit', _controllers2.default.itemController.editItem);
routes.delete('/item/delete/:id', _controllers2.default.itemController.deleteItem);

// Store Routes
routes.post('/store/create', _controllers2.default.storeController.createStore);
routes.get('/store/all', _controllers2.default.storeController.allStores);
routes.put('/store/edit', _controllers2.default.storeController.editStore);
routes.delete('/store/delete/:id', _controllers2.default.storeController.deleteStore);
routes.post('/store/addCategory', _controllers2.default.storeController.addCategory);
routes.get('/store/:id', _controllers2.default.storeController.getStore);
routes.get('/store/items/:id', _controllers2.default.storeController.getCategoryItems);
routes.get('/store/allCategorized/:city_id/:storeType_id', _controllers2.default.storeController.allCategorized);

// Store Type Routes
routes.post('/storeType/create', _controllers2.default.storeTypeController.create);
routes.get('/storeType/all', _controllers2.default.storeTypeController.all);
routes.put('/storeType/edit', _controllers2.default.storeTypeController.edit);
routes.delete('/storeType/delete/:id', _controllers2.default.storeTypeController.delete);
routes.post('/storeType/addStore', _controllers2.default.storeTypeController.addStore);
routes.get('/storeType/getStores/:storeType_id', _controllers2.default.storeTypeController.getStores);

// TopCategories Routes
routes.post('/top_category/create', _controllers2.default.topCategoriesController.create);

// History Routes
routes.post('/history/add', _controllers2.default.historyController.addToHistory);

// Add-On Routes
routes.post('/addOn/create', _controllers2.default.addOnController.create);
routes.post('/addOn/addItem', _controllers2.default.addOnController.addItem);
routes.get('/addOn/all', _controllers2.default.addOnController.allAddOns);
routes.get('/addOn/getAddOn/:id', _controllers2.default.addOnController.fetchAddOn);
routes.post('/addOn/removeItem', _controllers2.default.addOnController.removeItem);
routes.put('/addOn/edit', _controllers2.default.addOnController.editAddOn);
routes.delete('/addOn/delete/:id', _controllers2.default.addOnController.delete);

exports.default = routes;
//# sourceMappingURL=routes.js.map