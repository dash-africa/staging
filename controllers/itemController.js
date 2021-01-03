import db from '../models';

const itemController = {};

itemController.create = (req, res) => {
    const { price, image, name, description, category_id, isAddOn, isSellable, addOns } = req.body;

    db.Category.findById(category_id).then(category => {
        if (!category) {
            res.status(404).json({ status: false, message: 'The category with this id was not found' });
        } else {
            const item = new db.Item({
                price,
                image,
                name,
                description,
                _categoryId: category_id,
                isAddOn,
                isSellable,
                addOns
            });


            db.Item.create(item, (err, created) => {
                if (err) {
                    res.status(500).json({ status: false, message: 'The item was not created' });
                } else {
                    category.items.push(created._id);
                    category.save().then(saved => {
                        res.status(200).json({ status: true, message: 'Successfully created item', data: created });
                    });
                }
            });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

itemController.addToCart = (req, res) => {
    const { cart_id, item_id } = req.body;

    db.User.findById(req.user).then(user => {
        if (user === null) {
            res.status(404).json({ status: false, message: 'User not found' });
        } else {
            db.Item.findById(item_id).then(item => {
                if (item === null) {
                    res.status(404).json({ status: false, message: 'The item was not found' });
                } else {
                    db.Cart.findById(cart_id).then(cart => {
                        if (cart === null) {
                            const ncart = new db.Cart({
                                _userId: user._id,
                                items: [item._id]
                            });

                            db.Cart.create(ncart, (err, carted) => {
                                if (err) {
                                    res.status(500).json({ status: false, message: 'There was an error creating this cart' });
                                } else {
                                    res.status(200).json({ status: false, message: 'Created the cart and added item', data: carted });
                                }
                            });
                        } else {
                            cart.items.push(item._id);
                            cart.save().then(saved => {
                                res.status(200).json({ status: true, message: 'Successfully added item to cart', data: saved });
                            });
                        }
                    }).catch(err => res.status(500).json({ status: false, message: err.message }));
                }
            }).catch(err => {
                res.status(500).json({ status: false, message: err.message });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

itemController.fetchItem = (req, res) => {
    const itemId = req.params.itemId;

    db.Item.findById(itemId).populate({
        path: 'addOns', model: 'AddOns', populate: {
            path: 'items',
            model: 'Item'
        }
    }).then(item => {
        if (item === null) {
            res.status(404).json({ status: false, message: 'The item was not found' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: item });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

itemController.getAll = (req, res) => {
    const { populate } = req.query;

    db.Item.find().populate(populate ? {
        path: '_categoryId',
        populate: {
            path: '_storeId',
            select: 'name'
        },
    }: null).populate(populate ? 'addOns' : null).then(items => {
        if (items === null || items.length === 0) {
            res.status(404).json({ status: false, message: 'No item was found' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: items });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

itemController.editItem = (req, res) => {
    const { item_id, price, image, name, description, category_id, isAddOn, isSellable, addOns } = req.body;

    db.Item.findById(item_id).then(item => {
        if (!item) {
            res.status(404).json({ status: false, message: 'The item was not found' });
        } else {
            if (item._categoryId !== category_id) {
                db.Category.findById(item._categoryId).then(prev_category => {
                    if (!prev_category) {
                        return res.status(404).json({ status: false, message: 'The category of this item was not found' });
                    } else {
                        db.Category.findById(category_id).then(new_category => {
                            if (!new_category) {
                                return res.status(404).json({ status: false, message: 'The category of this item was not found' });
                            } else {
                                const idx = prev_category.items.indexOf(item_id);
                                if (idx !== -1) {
                                    prev_category.items.splice(idx, 1);
                                    prev_category.save();
                                }

                                new_category.items.push(item_id);
                                new_category.save();
                            }
                        }).catch(err => res.status(500).json({ status: false, message: err.message }));
                    }
                }).catch(err => res.status(500).json({ status: false, message: err.message }));
            }

            item.price = price;
            item.name = name;
            item.image = image;
            item.description = description;
            item.isAddOn = isAddOn;
            item.isSellable = isSellable;
            item._categoryId = category_id;
            item.addOns = addOns;

            item.save().then(saved => {
                res.status(200).json({ status: true, message: 'Successful', data: saved });
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

itemController.deleteItem = (req, res) => {
    const id = req.params.id;

    db.Item.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully deleted this item', data: deleted });
        }
    });
};

itemController.addAddOn = (req, res) => {
    const { item_id, addOn_id } = req.body;

    db.Item.findById(item_id).then(item => {
        if (!item) {
            res.status(404).json({ status: false, message: 'The item was not found' });
        } else {
            item.addOns.push(addOn_id);
            item.save().then(saved => {
                res.status(200).json({ status: true, message: 'Successful', data: saved });
            });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

itemController.removeAddOn = (req, res) => {
    const { item_id, addOn_id } = req.body;

    db.Item.findById(item_id).then(item => {
        if (item === null) {
            res.status(404).json({ status: false, message: 'The item was not found' });
        } else {
            const idx = item.stores.indexOf(addOn_id);
            if (idx !== -1) {
                item.addOns.splice(idx, 1);
            }
            res.status(200).json({ status: true, message: 'The add-on has been successfully removed', data: city });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

export default itemController;