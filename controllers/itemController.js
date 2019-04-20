import db from '../models';

const itemController  = {};

itemController.create = (req, res) => {
    const {price, image, name} = req.body;

    const item = new db.Item({
        price,
        image,
        name
    });

    db.Item.create(item, (err, created) => {
        if (err) {
            res.status(500).json({status: false, message: "The item was not created"});
        } else {
            res.status(200).json({status: true, message: 'Successfully created item', data: created});
        }
    });
};

itemController.addToCart = (req, res) => {
    const {cart_id, item_id} = req.body;

    db.User.findById(req.user).then(user => {
        if (user === undefined) {
            res.status(404).json({status: false, message: 'User not found'});
        } else {
            db.Item.findById(item_id).then(item => {
                if (item === undefined) {
                    res.status(404).json({status: false, message: 'The item was not found'});
                } else {
                    db.Cart.findById(cart_id).then(cart => {
                        if (cart === undefined) {
                            const ncart = new db.Cart({
                                _userId: user._id,
                                items: [item._id]
                            });

                            db.Cart.create(ncart, (err, carted) => {
                                if (err) {
                                    res.status(500).json({status: false, message: 'There was an error creating this cart'});
                                } else {
                                    res.status(200).json({status: false, message: 'Created the cart and added item', data: carted});
                                }
                            });
                        } else {
                            cart.items.push(item._id);
                            cart.save().then(saved => {
                                res.status(200).json({status: true, message: 'Successfully added item to cart', data: saved});
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

itemController.fetchItem = (req, res) => {
    const {item_id} = req.body;

    db.Item.findById(item_id).then(item => {
        if (item === undefined) {
            res.status(404).json({status: false, message: 'The item was not found'});
        } else {
            res.status(200).json({status: true, message: 'Found', data: item});
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

itemController.getAll = (req, res) => {
    db.Item.find().then(items => {
        if (items === undefined || items.length === 0) {
            res.status(404).json({status: false, message: 'No item was found'});
        } else {
            res.status(200).json({status: true, message: 'Found', data: items});
        }
    }).catch(err => res.status(500).json({status: false, message: err.message}));
};

itemController.editItem = (req, res) => {
    const {item_id, price, image, name} = req.body;
    db.Item.findOneAndUpdate({_id: item_id}, {$set: {name, image, price}}, {new: true}, (err, updated) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully updated the item', data: updated});
        }
    });
};

itemController.deleteItem = (req, res) => {
    const id = req.params.id;
    db.Item.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully deleted this item', data: deleted});
        }
    });
};

export default itemController;