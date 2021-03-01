import express from 'express';
import controllers from '../controllers';
import { verifyToken, verifyDriverToken, verifyAdminToken, verifyStoreToken } from './../utils';

const routes = express();


routes.get('/', (req, res) => {
    res.json({ status: true });
});

// admin routes
routes.post('/admin/login', controllers.adminController.login);
routes.post('/admin/register', controllers.adminController.register);
routes.post('/admin/verifyDriver', verifyAdminToken, controllers.adminController.verifyDriver);
routes.delete('/admin/deleteDriver/:id', verifyAdminToken, controllers.adminController.deleteDriver);
routes.post('/admin/driver/authenticate', verifyAdminToken, controllers.adminController.assignStoreCredentials);
routes.post('/admin/driver/disable', verifyAdminToken, controllers.adminController.disableDriver);

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
routes.get('/user/getOrders', verifyToken, controllers.userController.getAllOrders);
routes.get('/user/getPendingOrders', verifyToken, controllers.userController.getAllPendingOrders);
routes.post('/user/completeOrder', verifyToken, controllers.userController.completeOrder);
routes.post('/user/rateDriver', verifyToken, controllers.userController.rateDriver);
routes.post('/user/cancelOrder', verifyToken, controllers.userController.cancelOrder);

// Cart Routes
routes.post('/cart/create', verifyToken, controllers.cartController.createCart);
routes.get('/cart/getCart/:id', controllers.cartController.fetchCart);
routes.post('/cart/addItem', controllers.cartController.addItems);
routes.post('/cart/removeItem', controllers.cartController.removeItem);

// Category Routes
routes.post('/category/create', verifyAdminToken, controllers.categoryController.createCategory);
routes.post('/category/addItem', verifyAdminToken, controllers.categoryController.addItem);
routes.get('/category/all', controllers.categoryController.allCategories);
routes.put('/category/edit', verifyAdminToken, controllers.categoryController.editCategory);
routes.delete('/category/delete/:id', verifyAdminToken, controllers.categoryController.deleteCategory);
routes.post('/category/removeItem', verifyAdminToken, controllers.categoryController.removeItem);

// City Routes
routes.post('/city/create', verifyAdminToken, controllers.cityControler.createCity);
routes.post('/city/addStore', verifyAdminToken, controllers.cityControler.addStore);
routes.get('/city/all', controllers.cityControler.allCities);
routes.post('/city/removeStore', verifyAdminToken, controllers.cityControler.removeStore);
routes.put('/city/edit', verifyAdminToken, controllers.cityControler.editCity);
routes.delete('/city/delete/:id', verifyAdminToken, controllers.cityControler.deleteCity);
routes.get('/city/stores/:cityId', controllers.cityControler.fetchStores);
routes.get('/city/topCategories/:cityId', controllers.cityControler.getAllTopCategories);

// Item Routes
routes.post('/item/create', verifyAdminToken, controllers.itemController.create);
routes.post('/item/addToCart', verifyAdminToken, controllers.itemController.addToCart);
routes.post('/item/addAddOn', verifyAdminToken, controllers.itemController.addAddOn);
routes.post('/item/removeAddOn', verifyAdminToken, controllers.itemController.removeAddOn);
routes.get('/item/getItem/:itemId', controllers.itemController.fetchItem);
routes.get('/item/all', controllers.itemController.getAll);
routes.put('/item/edit', verifyAdminToken, controllers.itemController.editItem);
routes.delete('/item/delete/:id', verifyAdminToken, controllers.itemController.deleteItem);

// Store Routes
routes.post('/store/create', verifyAdminToken, controllers.storeController.createStore);
routes.get('/store/all', controllers.storeController.allStores);
routes.put('/store/edit', verifyAdminToken, controllers.storeController.editStore);
routes.delete('/store/delete/:id', verifyAdminToken, controllers.storeController.deleteStore);
routes.post('/store/addCategory', verifyAdminToken, controllers.storeController.addCategory);
routes.post('/store/login', controllers.storeController.login);
routes.get('/store/:id', controllers.storeController.getStore);
routes.get('/store/items/:id', controllers.storeController.getCategoryItems);
routes.get('/store/allCategorized/:city_id/:storeType_id', controllers.storeController.allCategorized);
routes.post('/store/acceptOrder', verifyStoreToken, controllers.storeController.acceptOrder);
routes.post('/store/cancelOrder', verifyStoreToken, controllers.storeController.cancelOrder);
routes.get('/store/history/:id', controllers.storeController.getHistory);
routes.post('/store/withdrawEarnings', verifyStoreToken, controllers.storeController.withdrawEarnings);
routes.get('/store/earnings', verifyStoreToken, controllers.storeController.getAllEarnings);

// Store Type Routes
routes.post('/storeType/create', verifyAdminToken, controllers.storeTypeController.create);
routes.get('/storeType/all', controllers.storeTypeController.all);
routes.put('/storeType/edit', verifyAdminToken, controllers.storeTypeController.edit);
routes.delete('/storeType/delete/:id', verifyAdminToken, controllers.storeTypeController.delete);
routes.post('/storeType/addStore', verifyAdminToken, controllers.storeTypeController.addStore);
routes.get('/storeType/getStores/:storeType_id', controllers.storeTypeController.getStores);

// TopCategories Routes
routes.post('/top_category/create', verifyAdminToken, controllers.topCategoriesController.create);

// History Routes
routes.post('/history/add', verifyToken, controllers.historyController.addToHistory);
routes.get('/history/fetch/:id', controllers.historyController.fetchHistory);
routes.get('/history/all', controllers.historyController.fetchAllHistory);

// Add-On Routes
routes.post('/addOn/create', verifyAdminToken, controllers.addOnController.create);
routes.post('/addOn/addItem', verifyAdminToken, controllers.addOnController.addItem);
routes.get('/addOn/all', controllers.addOnController.allAddOns);
routes.get('/addOn/getAddOn/:id', controllers.addOnController.fetchAddOn);
routes.post('/addOn/removeItem', verifyAdminToken, controllers.addOnController.removeItem);
routes.put('/addOn/edit', verifyAdminToken, controllers.addOnController.editAddOn);
routes.delete('/addOn/delete/:id', verifyAdminToken, controllers.addOnController.delete);

// Driver Routes
routes.post('/driver/login', controllers.driverController.login);
routes.post('/driver/register', controllers.driverController.register);
routes.post('/driver/confirmation', controllers.driverController.confirmationPost);
routes.post('/driver/resend', controllers.driverController.resendTokenPost);
routes.post('/driver/sendForget', controllers.driverController.resendForgottenToken);
routes.post('/driver/forgot_password', controllers.driverController.changePassword);
routes.post('/driver/sendOtp', verifyDriverToken, controllers.driverController.sendOtpToPhone);
routes.post('/driver/verifyPhoneNumber', verifyDriverToken, controllers.driverController.verifyPhoneNumber);
routes.get('/driver/all', controllers.driverController.getAllDrivers);
routes.get('/driver/getInfo', verifyDriverToken, controllers.driverController.getDriverInfo);
routes.post('/driver/acceptOrder', verifyDriverToken, controllers.driverController.acceptOrder);
routes.post('/driver/pickOrder', verifyDriverToken, controllers.driverController.pickUpOrder);
routes.post('/driver/deliverOrder', verifyDriverToken, controllers.driverController.deliverOrder);
routes.get('/driver/earnings', verifyDriverToken, controllers.driverController.getAllEarnings);
routes.post('/driver/withdrawEarnings', verifyDriverToken, controllers.driverController.withdrawEarnings);

export default routes;