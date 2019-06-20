import db from '../models';

const historyController = {};

historyController.addToHistory = (req, res) => {
    const {store_id, cart_id, user_id, paymentRef, status} = req.body;

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
                    res.status(200).json({status: true, message: 'Successfully added to history', data: saved});
                });
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

export default historyController;