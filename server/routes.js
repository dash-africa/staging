import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../models';
import controllers from '../controllers';

const routes = express();

function verifyToken(req, res, next) {
    // GET THE AUTH HEADER VALUE
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data) => {
            if (data) {
                db.User.findById(data.user).then((user) => {
                    if (user) {
                        req.user = data.user;
                        next();
                    } else {
                        res.status(403).json({ status: false, message: 'Unauthorized' });
                    }
                }).catch((err) => {
                    if (err) { res.status(403).json({ status: false, message: 'Unauthorized' }); }
                });
            } else {
                res.status(403).json({ status: false, message: 'Unauthorized' });
            }
        });
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}


routes.get('/', (req, res) => {
    res.json({ status: true });
});

// admin routes
routes.post('/admin/login', controllers.adminController.login);
routes.post('/admin/register', controllers.adminController.register);
routes.post('/admin/verifyDriver', controllers.adminController.verifyDriver);
routes.delete('/admin/deleteDriver', controllers.adminController.deleteDriver);

// user routes
routes.post('/user/login', controllers.userController.loginUser);
routes.post('/user/register', controllers.userController.registerUser);
routes.post('/confirmation', controllers.userController.confirmationPost);
routes.post('/resend', controllers.userController.resendTokenPost);
routes.post('/sendForget', controllers.userController.resendForgottenToken);
routes.post('/forgot_password', controllers.userController.changePassword);
routes.post('/sendOtp', verifyToken, controllers.userController.sendOtpToPhone);
routes.post('/verifyPhoneNumber', verifyToken, controllers.userController.verifyPhoneNumber);
routes.get('/user/all', controllers.userController.getAllUsers);
routes.post('/user/getInfo', verifyToken, controllers.userController.getUserInfo);
routes.get('/user/fetchCart', verifyToken, controllers.userController.fetchUserCart);
routes.get('/user/fetchCards', verifyToken, controllers.userController.fetchUserCards);

// Cart Routes
routes.post('/cart/create', verifyToken, controllers.cartController.createCart);
routes.get('/cart/getCart/:id', controllers.cartController.fetchCart);
routes.post('/cart/addItem', controllers.cartController.addItems);

// Category Routes
routes.post('/category/create', controllers.categoryController.createCategory);
routes.post('/category/addItem', controllers.categoryController.addItem);
routes.get('/category/all', controllers.categoryController.allCategories);
routes.put('/category/edit', controllers.categoryController.editCategory);
routes.delete('/category/delete/:id', controllers.categoryController.deleteCategory);
routes.post('/category/removeItem', controllers.categoryController.removeItem);

// City Routes
routes.post('/city/create', controllers.cityControler.createCity);
routes.post('/city/addStore', controllers.cityControler.addStore);
routes.get('/city/all', controllers.cityControler.allCities);
routes.post('/city/removeStore', controllers.cityControler.removeStore);
routes.put('/city/edit', controllers.cityControler.editCity);
routes.delete('/city/delete/:id', controllers.cityControler.deleteCity);
routes.get('/city/stores/:cityId', controllers.cityControler.fetchStores);
routes.get('/city/topCategories/:cityId', controllers.cityControler.getAllTopCategories);

// Item Routes
routes.post('/item/create', controllers.itemController.create);
routes.post('/item/addToCart', controllers.itemController.addToCart);
routes.post('/item/addAddOn', controllers.itemController.addAddOn);
routes.post('/item/removeAddOn', controllers.itemController.removeAddOn);
routes.get('/item/getItem/:itemId', controllers.itemController.fetchItem);
routes.get('/item/all', controllers.itemController.getAll);
routes.put('/item/edit', controllers.itemController.editItem);
routes.delete('/item/delete/:id', controllers.itemController.deleteItem);

// Store Routes
routes.post('/store/create', controllers.storeController.createStore);
routes.get('/store/all', controllers.storeController.allStores);
routes.put('/store/edit', controllers.storeController.editStore);
routes.delete('/store/delete/:id', controllers.storeController.deleteStore);
routes.post('/store/addCategory', controllers.storeController.addCategory);
routes.get('/store/:id', controllers.storeController.getStore);
routes.get('/store/items/:id', controllers.storeController.getCategoryItems);
routes.get('/store/allCategorized/:city_id/:storeType_id', controllers.storeController.allCategorized);

// Store Type Routes
routes.post('/storeType/create', controllers.storeTypeController.create);
routes.get('/storeType/all', controllers.storeTypeController.all);
routes.put('/storeType/edit', controllers.storeTypeController.edit);
routes.delete('/storeType/delete/:id', controllers.storeTypeController.delete);
routes.post('/storeType/addStore', controllers.storeTypeController.addStore);
routes.get('/storeType/getStores/:storeType_id', controllers.storeTypeController.getStores);

// TopCategories Routes
routes.post('/top_category/create', controllers.topCategoriesController.create);

// History Routes
routes.post('/history/add', controllers.historyController.addToHistory);

// Add-On Routes
routes.post('/addOn/create', controllers.addOnController.create);
routes.post('/addOn/addItem', controllers.addOnController.addItem);
routes.get('/addOn/all', controllers.addOnController.allAddOns);
routes.get('/addOn/getAddOn/:id', controllers.addOnController.fetchAddOn);
routes.post('/addOn/removeItem', controllers.addOnController.removeItem);
routes.put('/addOn/edit', controllers.addOnController.editAddOn);
routes.delete('/addOn/delete/:id', controllers.addOnController.delete);

// Driver Routes
routes.post('/driver/login', controllers.driverController.login);
routes.post('/driver/register', controllers.driverController.register);
routes.post('/driver/confirmation', controllers.driverController.confirmationPost);
routes.post('/driver/resend', controllers.driverController.resendTokenPost);
routes.post('/driver/sendForget', controllers.driverController.resendForgottenToken);
routes.post('/driver/forgot_password', controllers.driverController.changePassword);
routes.post('/driver/sendOtp', verifyToken, controllers.driverController.sendOtpToPhone);
routes.post('/driver/verifyPhoneNumber', verifyToken, controllers.driverController.verifyPhoneNumber);
routes.get('/driver/all', controllers.driverController.getAllDrivers);
routes.post('/driver/getInfo', verifyToken, controllers.driverController.getDriverInfo);

export default routes;