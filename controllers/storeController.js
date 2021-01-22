import db from '../models';
import bcrypt from 'bcryptjs';
import { signUser, sendMail, createTransporter } from './../utils';
import controllers from '.';
import { OrderStatus } from './../constants';

const storeController = {};

storeController.createStore = (req, res) => {
    const { name, city_id, storeType_id, delivery_time, tags, image, address, schedule, coordinates, bank_name, bank_code, account_number } = req.body;

    db.City.findById(city_id).then(city => {
        if (city === null) {
            res.status(500).json({ status: false, message: 'The city was not found' });
        } else {
            db.StoreType.findById(storeType_id).then(storeType => {
                if (storeType === null) {
                    res.status(500).json({ status: false, message: 'The store type was not found' });
                } else {
                    const store = new db.Store({
                        name,
                        _cityId: city_id,
                        _storeTypeId: storeType_id,
                        delivery_time,
                        tags,
                        image,
                        address,
                        schedule,
                        coordinates,
                        bank_name,
                        bank_code,
                        account_number
                    });

                    db.Store.create(store, (err, created) => {
                        if (err) {
                            res.status(500).json({ status: false, message: `An error while creating the store ${err}` });
                        } else {
                            storeType.stores.push(created._id);
                            storeType.save().then(stored => {
                                city.stores.push(created._id);
                                city.save().then(saved => {
                                    res.status(200).json({ status: true, message: 'Created the store successfully', data: created });
                                });
                            });
                        }
                    });
                }
            }).catch(err => {
                res.status(500).json({ status: false, message: err.message });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

storeController.allStores = (req, res) => {
    const { populate } = req.query;

    db.Store.find().populate(populate ? ['_storeTypeId', '_cityId'] : null).then(stores => {
        if (stores === null || stores.length === 0) {
            res.status(404).json({ status: false, message: 'No store was found' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: stores });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

storeController.allCategorized = (req, res) => {
    const { city_id, storeType_id } = req.params;

    db.City.findById(city_id).then(city => {
        if (city == null) {
            res.status(404).json({ status: false, message: 'The city with this id was not found' });
        } else {
            db.StoreType.findById(storeType_id).then(storeType => {
                if (storeType === null) {
                    res.status(404).json({ status: false, message: 'The store type with this id was not found' });
                } else {
                    db.Store.find({ _cityId: city_id, _storeTypeId: storeType_id }).populate('categories').populate('top_categories').then(stores => {
                        if (stores === null || stores.length === 0) {
                            res.status(404).json({ status: false, message: 'No store was found' });
                        } else {
                            res.status(200).json({ status: true, message: 'Found', data: stores });
                        }
                    }).catch(err => res.status(500).json({ status: false, message: err.message }));
                }
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

storeController.editStore = (req, res) => {
    const { store_id, name, delivery_time, tags, image, schedule } = req.body;
    db.Store.findOneAndUpdate({ _id: store_id }, { $set: { name, delivery_time, tags, image, schedule } }, { new: true }, (err, updated) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully updated the store', data: updated });
        }
    });
};

storeController.deleteStore = (req, res) => {
    const id = req.params.id;
    db.Store.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully deleted this store', data: deleted });
        }
    });
};

storeController.addCategory = (req, res) => {
    const { store_id, category_id } = req.body;

    db.Store.findById(store_id).then(store => {
        if (store === null) {
            res.status(404).json({ status: false, message: 'The store was not found' });
        } else {
            store.categories.push(category_id);
            store.save().then(saved => {
                res.status(200).json({ status: true, message: 'Added category', data: saved });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

storeController.getStore = (req, res) => {
    db.Store.findById(req.params.id).populate({
        path: 'categories', model: 'Category', populate: {
            path: 'items',
            model: 'Item'
        }
    }).populate('top_categories').then(store => {
        if (store === null) {
            res.status(404).json({ status: false, message: 'The store was not found' });
        } else {
            res.status(200).json({ status: true, message: 'Added category', data: store });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

storeController.getCategoryItems = (req, res) => {
    const { populate } = req.query;

    db.Store.findById(req.params.id).populate({ path: 'categories', populate: { path: 'items',
        ...(populate && {
            populate: {
                path: '_categoryId',
                populate: {
                    path: '_storeId',
                    select: 'name'
                },
            }
        })
    } }).then(store => {
        if (store === null) {
            res.status(404).json({ status: false, message: 'The store was not found' });
        } else {
            res.status(200).json({ status: true, message: 'items in the category', data: store });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

storeController.login = (req, res) => {
    const { username, password } = req.body;

    db.Store.findOne({ username }).then(store => {
        if (!store) {
            res.status(404).json({ status: false, message: 'The store account was not found' });
        } else {
            bcrypt.compare(password, store.password, function (err, response) {
                if (response === true) {
                    signUser(store._id).then((token) => {
                        res.status(200).json({ status: true, message: "Store logged in succesfully", token });
                    }).catch((err) => {
                        res.status(500).json({ status: false, message: err.message });
                    });
                } else {
                    res.status(400).json({ status: false, message: 'Wrong login details' });
                }
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

storeController.acceptOrder = (req, res) => {
    const { orderId, storeId } = req.body;
    const status = OrderStatus.RESTAURANT_ACCEPTED;

    db.Store.findById(storeId).then(store => {
        if (!store) {
            res.status(404).json({ status: false, message: 'The store account was not found' });
        } else {
            controllers.firebaseController.changeStatus(orderId, null, status).then(firebaseObj => {
                if (firebaseObj) {
                    db.History.findById(firebaseObj.history_id).then(history => {
                        if (!history) {
                            res.status(404).json({ status: false, message: 'The history linked to this order was not found' });
                        } else {
                            history.status = status;
                            history.restaurantAcceptedTime = new Date();

                            history.save().then(saved => {
                                res.status(200).json({ status: true, message: 'Store just accepted order' });
                            });
                        }
                    }).catch(err => res.status(500).json({ status: false, message: err.message }));
                } else {
                    res.status(500).json({ status: false, message: 'Internal Server Error (Firebase)' });
                }
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

storeController.cancelOrder = (req, res) => {
    const { historyId, storeId } = req.body;
    const status = OrderStatus.RESTAURANT_DECLINED;

    db.Store.findById(storeId).then(store => {
        if (!store) {
            res.status(404).json({ status: false, message: 'The store account was not found' });
        } else {
            db.History.findById(historyId).then(history => {
                if (!history) {
                    res.status(404).json({ status: false, message: 'The history linked to this order was not found' })
                } else {
                    if (history.status !== OrderStatus.DRIVER_ACCEPTED) {
                        res.status(404).json({ status: false, message: 'Restaurant can only cancel an order accepted by driver' })
                    } else {
                        controllers.firebaseController.deleteEntry(history.orderId).then(firebaseObj => {
                            if (firebaseObj) {
                                history.status = status;
                                history.cancellationTime = new Date();
    
                                db.User.findById(history.user).then(async user => {
                                    if (!user) {
                                        res.status(404).json({ status: false, message: 'The user was not found' });
                                    } else {
                                        const response = await createRefund(history.paymentRef);

                                        if (response.status) {
                                            history.save().then(saved => {
                                                sendMail('failed-order.ejs', { 
                                                    lastname: user.lastname, 
                                                    orderNo: history.orderId,
                                                    host: req.headers.host, 
                                                    protocol: req.protocol 
                                                }).then(async data => {
                                                    const mailOptions = {
                                                        from: 'dash@yourwebapplication.com',
                                                        to: user.email,
                                                        subject: `Your order has been cancelled.`,
                                                        html: data
                                                    };
                
                                                    const transporter = await createTransporter();
                
                                                    transporter.sendMail(mailOptions, err => {
                                                        if (err) res.status(500).json({ status: false, message: 'An error occured while sending cancellation email' });
            
                                                        removeItem(user.new_order_firebase_uid, history.orderId);
                                                        
                                                        user.save(saved => {
                                                            res.status(200).json({ status: true, message: 'Store has declined order, and user has been refunded successfully' });
                                                        });
                                                    })
                                                })
                                            });
                                        } else {
                                            return res.status(409).json({ status: false, message: 'An error occured from paystack while trying to refund customer' });
                                        }
                                    }
                                })
                            } else {
                                res.status(500).json({ status: false, message: 'Internal Server Error (Firebase)' });
                            }
                        }).catch(err => res.status(500).json({ status: false, message: err.message }));
                    }
                }
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

storeController.getHistory = (req, res) => {
    const { id: storeId } = req.params;

    db.Store.findById(storeId).then(store => {
        if (!store) {
            res.status(404).json({ status: false, message: 'The store account was not found' });
        } else {
            db.History.find({ store: storeId }).then(storeHistories => {
                if (!storeHistories) {
                    res.status(404).json({ status: true, message: 'This store has no histories yet', data: [] });
                } else {
                    let filteredHistory = storeHistories.filter(history => history.status === OrderStatus.PICKED);
                    filteredHistory = filteredHistory.filter(history => history.status === OrderStatus.RESTAURANT_DECLINED);

                    res.status(200).json({ status: true, message: 'Store history', data: filteredHistory });
                }
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

storeController.withdrawEarnings = (req, res) => {
    const { storeId } = req.body;

    db.Store.findById(storeId).then(async store => {
        if (!store) {
            res.status(404).json({ status: false, message: 'The store was not found' });
        } else {
            let recipientCode = '';
            if (!store.recipient_code) {
               const response = await createTransferRecipient(`${store.name}`, store.account_number, store.bank_code);

               if (response.status) {
                   recipientCode = response.data.recipient_code;
               } else {
                    res.status(409).json({ status: false, message: 'There was an issue retrieving store recipient code' });
               }
            } else {
                recipientCode = store.recipient_code;
            }

            if (store.overall_earnings <= 0) {
                res.status(400).json({ status: false, message: 'Store has no earnings, so withdrawal was skipped' });
            } else {
                const transferResponse = await initiateTransfer(store.overall_earnings, recipientCode);
    
                if (transferResponse.status) {
                    store.overall_earnings = 0;
    
                    store.save(saved => {
                        res.status(200).json({ status: true, message: 'The transfer was successful', data: transferResponse.data });
                    });
                } else {
                    res.status(500).json({ status: false, message: 'An error occured while transfer was being processed' });
                }
            }
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

export default storeController;