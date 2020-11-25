import db from '../models';
import controllers from './index';
import { verifyPayment } from './../utils';

const historyController = {};

historyController.addToHistory = (req, res) => {
    const {store_id, cart_id, user_id, paymentRef, status, amount, delivery_fee, service_fee, delivery_address, isNewPayment} = req.body;

    db.User.findById(user_id).then(user => {
        if (user === null) {
            res.status(404).json({status: false, message: 'The user was not found'});
        } else {
            db.Cart.findById(cart_id).then(async cart => {
                if (!cart) {
                    res.status(404).json({status: false, message: 'Cart not found'});
                } else {
                    if (isNewPayment) {
                        const paymentVerification = await verifyPayment(paymentRef);
                        const { authorization, customer } = paymentVerification;
                        const {
                            authorization_code,
                            card_type,
                            last4,
                            exp_month,
                            exp_year,
                            bin,
                            bank,
                            channel,
                            signature,
                            reusable,
                            country_code,
                            account_name
                        } = authorization;

                        const { customer_code, email } = customer;

                        if (paymentVerification) {
                            const card = new db.Card({
                                user: user_id,
                                authorization_code,
                                card_type,
                                last4,
                                exp_month,
                                exp_year,
                                bin,
                                bank,
                                channel,
                                signature,
                                reusable,
                                country_code,
                                account_name,
                                customer_code,
                                email
                            });
                        }
                    }

                    const history = new db.History({
                        store: store_id,
                        items: cart.items,
                        user: user_id,
                        paymentRef,
                        deliveryFee: delivery_fee,
                        serviceFee: service_fee,
                        totalItemAmount: amount,
                        deliveryAddress: delivery_address,
                        status
                    });
        
                    history.save().then(saved => {
                        cart.items = [];
                        cart.save().then(empty => {
                            controllers.firebaseController.createNewOrder(store_id, delivery_fee, delivery_address, service_fee, amount, history.id, status, user_id).then(uid => {
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