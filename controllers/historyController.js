import db from '../models';
import controllers from './index';

const historyController = {};

historyController.addToHistory = (req, res) => {
    const {store_id, cart_id, user_id, paymentRef, status, amount, delivery_fee} = req.body;

    db.User.findById(user_id).then(user => {
        if (user === null) {
            res.status(404).json({status: false, message: 'The user was not found'});
        } else {
            db.Cart.findById(cart_id).then(cart => {
                if (cart === null) {
                    res.status(404).json({status: false, message: 'Cart not found'});
                } else {
                    const history = new db.History({
                        store: store_id,
                        items: cart.items,
                        user: user_id,
                        paymentRef,
                        status
                    });
        
                    history.save().then(saved => {
                        cart.items = [];
                        cart.save().then(empty => {
                            controllers.firebaseController.createNewOrder(store_id, delivery_fee, amount, history.id, status, user_id).then(uid => {
                                user.new_order_firebase_uid.push(uid);
                                user.history.push(history.id);
                                user.save().then(saves => {
                                    res.status(200).json({status: true, message: 'Successfully added to history and firebase', data: saved});
                                });
                            });
                        });
                    });
                }
            }).catch(err => {
                res.status(500).json({status: false, message: err.message});
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });

};

export default historyController;