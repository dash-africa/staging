import db from '../models';

const cartController = {};

cartController.createCart = (req, res) => {
    db.User.findById(req.user).then(user => {
        if (user === null) {
            res.status(404).json({ status: false, message: 'The user was not found' });
        } else {
            const cart = new db.Cart({
                _userId: user._id
            });

            db.Cart.create(cart, (err, created) => {
                if (err) {
                    res.status(500).json({ status: false, message: "The cart was not created " + err.message });
                } else {
                    user.carts.push(created._id);
                    user.save().then(saved => {
                        res.status(200).json({ status: true, message: 'Successfully created this cart', data: saved });
                    });
                }
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

cartController.fetchCart = (req, res) => {
    db.Cart.findById(req.params.id).sort({ 'created_at': -1 }).populate('_userId').populate('items').then(cart => {
        if (cart === null) {
            res.status(404).json({ status: false, message: 'Cart not found' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: cart });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

cartController.addItems = (req, res) => {
    const { cart_id, items } = req.body;

    db.Cart.findById(cart_id).then(cart => {
        if (cart === null) {
            res.status(404).json({ status: false, message: 'Cart not found' });
        } else {
            cart.items = items;
            cart.save().then(saved => {
                res.status(200).json({ status: true, message: 'Successfully added the item to the cart', data: saved });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

export default cartController;