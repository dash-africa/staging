import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../models';
import controllers from '../controllers';

const routes = express();

function verifyToken (req, res, next){
    // GET THE AUTH HEADER VALUE
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data)=>{
            db.User.findById(data.user).then((user)=>{
                if (user) {
                    req.user = data.user   ; 
                    next();             
                }else{
                    res.status(403).json({ status: false, message: 'Unauthorized' });
                }
            }).catch((err)=>{
                if (err) { res.status(403).json({ status: false, message: 'Unauthorized' }); }
            });
        });
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}


routes.get('/', (req, res)=>{
    res.json({status: true});
});

// user routes
routes.post('/user/login', controllers.userController.loginUser);
routes.post('/user/register', controllers.userController.registerUser);
routes.post('/confirmation', controllers.userController.confirmationPost);
routes.post('/resend', controllers.userController.resendTokenPost);
routes.post('/sendForget', controllers.userController.resendForgottenToken);
routes.post('/forgot_password', controllers.userController.changePassword);
routes.get('/user/all', controllers.userController.getAllUsers);
routes.post('/user/getInfo', verifyToken, controllers.userController.getUserInfo);
routes.get('/user/fetchCart', verifyToken, controllers.userController.fetchUserCart);

// Cart Routes
routes.post('/cart/create', verifyToken, controllers.cartController.createCart);
routes.post('/cart/fetch', controllers.cartController.fetchCart);

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
routes.post('/city/fetch', controllers.cityControler.fetchCity);

// Item Routes
routes.post('/item/create', controllers.itemController.create);
routes.post('/item/addToCart', controllers.itemController.addToCart);
routes.post('/item/fetch', controllers.itemController.fetchItem);
routes.get('/item/all', controllers.itemController.getAll);
routes.put('/item/edit', controllers.itemController.editItem);
routes.delete('/item/delete/:id', controllers.itemController.deleteItem);

// Store Routes
routes.post('/store/create', controllers.storeController.createStore);
routes.get('/store/all', controllers.storeController.allStores);
routes.put('/store/edit', controllers.storeController.editStore);
routes.delete('/store/delete/:id', controllers.storeController.deleteStore);
routes.post('/store/addCategory', controllers.storeController.addCategory);

export default routes;