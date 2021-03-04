import db from '../models';
import controllers from './index';
import { addPaystackChargeToamount, transporter, chargeCard, formatItems, sendMail, verifyPayment, removeItem } from './../utils';

const historyController = {};

historyController.addToHistory = (req, res) => {
    const {store_id, cart_id, status, amount, delivery_fee, service_fee, delivery_address, is_new_payment, last4, card_type} = req.body;
    let { paymentRef } = req.body;

    const user_id = req.user;

    db.User.findById(user_id).then(user => {
        if (user === null) {
            res.status(404).json({status: false, message: 'The user was not found'});
        } else {
            db.Cart.findById(cart_id).then(async cart => {
                if (!cart) {
                    res.status(404).json({status: false, message: 'Cart not found'});
                } else {
                    if (is_new_payment) {
                        const paymentVerification = await verifyPayment(paymentRef);

                        if (!paymentVerification.status) {
                            return res.status(400).json({status: false, message: 'Could not verify the transaction, Transaction reference not found!'});
                        }

                        const { authorization, customer, amount: paidAmount } = paymentVerification.data;

                        if (amount !== (paidAmount/100)) {
                            return res.status(400).json({status: false, message: 'Payment verification failure, amounts do not match'});
                        }

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

                        db.Card.findOne({ email, last4, bank }).then(card => {
                            if (!card) {
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

                                user.cards.push(card);
                                card.save();
                            }
                        }).catch(err => {
                            res.status(404).json({ status: false, message: err.message });
                        });
                    } else {
                        // get card
                        await db.Card.findOne({ user: user_id, last4 }).then(async card => {
                            if (card) {
                                const charge = await chargeCard(card.authorization_code, card.email, addPaystackChargeToamount(amount));

                                if (charge.status) {
                                    paymentRef = charge.data.reference;
                                } else {
                                    return res.status(401).json({ status: false, message: 'Unauthorized, Recurrent charge was not successful' });
                                }
                            } else {
                                return res.status(404).json({ status: false, message: 'Card not found!' });
                            }
                        }).catch(err => {
                            return res.status(404).json({ status: false, message: err.message });
                        });
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
                        assignedDriver: null,
                        status
                    });

                    db.Store.findById(store_id).then(store => {
                        if (!store) {
                            res.status(404).json({status: false, message: 'Store not found'});
                        } else {
                            controllers.firebaseController.createNewOrder({
                                user: user_id,
                                store: store_id, 
                                storeName: store.name,
                                storeAddress: store.address,
                                history_id: history.id, 
                                delivery_fee: delivery_fee, 
                                service_fee: service_fee, 
                                delivery_address: delivery_address, 
                                amount: amount, 
                                status: status, 
                                date_created: `${new Date()}`,
                                customer_name: `${user.lastname} ${user.firstname}`,
                                customer_phone: user.phone,
                                items: JSON.stringify(cart.items),
                                assignedDriver: null
                            }).then(uid => {
                            user.new_order_firebase_uid.push(uid);
                            user.history.push(history.id);

                            history.orderId = uid;

                            // Generate jwt for email confirmation token
                            sendMail('order.ejs', { 
                                lastname: user.lastname, 
                                orderNo: uid,
                                items: formatItems(cart.items),
                                host: req.headers.host, 
                                protocol: req.protocol 
                            }).then(data => {
                                const mailOptions = {
                                    from: 'dashdeliveryapp@gmail.com',
                                    to: user.email,
                                    subject: `Your order ${uid} has been confirmed.`,
                                    html: data
                                };

                                transporter.sendMail(mailOptions, (err) => {
                                    if (err) {
                                        return res.status(500).send({
                                            msg: err.message
                                        });
                                    }

                                    // Empty cart
                                    cart.items = [];
                                    cart.save().then(empty => {  
                                        history.save().then(saved => {
                                            // remove cart from user
                                            removeItem(user.carts, cart_id);

                                            user.save().then(saves => {
                                                res.status(200).json({status: true, message: 'Successfully, added to history and firebase', data: saved});
                                            });
                                        })                                          
                                    });

                                });
                            })

                        });
                        }
                    }).catch(err => res.status(500).json({status: false, message: err.message}));
                }
            }).catch(err => {
                res.status(500).json({status: false, message: err.message});
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

historyController.fetchHistory = (req, res) => {
    const { id } = req.params;

    db.History.findById(id).populate([
        { path: 'user', select: ['firstname', 'lastname', 'email', 'phone'] },
        { path: 'items', populate: 'addOns' },
        { path: 'store', select: 'name' },
        { path: 'assignedDriver', model: 'Driver', select: ['firstname', 'lastname', 'email', 'phone', 'mode_of_transportation'] }
    ]).then(history => {
        if (!history) {
            res.status(404).json({ status: false, message: 'The order history was not found' });
        } else {
            res.status(200).json({ status: true, message: 'History', data: history });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
}

historyController.fetchAllHistory = (req, res) => {
    db.History.find().populate([
        { path: 'user', select: ['firstname', 'lastname', 'email', 'phone'] },
        { path: 'items', populate: 'addOns' },
        { path: 'store', select: 'name' },
        { path: 'assignedDriver', model: 'Driver', select: ['firstname', 'lastname', 'email', 'phone', 'mode_of_transportation'] }
    ]).then(histories => {
        if (!histories || !histories.length) {
            res.status(404).json({ status: false, message: 'No history was found', data: [] })
        } else {
            res.status(200).json({ status: true, message: 'Found histories', data: histories });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
}

export default historyController;