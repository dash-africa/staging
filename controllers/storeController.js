import db from '../models';

const storeController = {};

storeController.createStore = (req, res) => {
    const {name, city_id, delivery_time, tags} = req.body;

    db.City.findById(city_id).then(city => {
        if (city === undefined) {
            res.status(500).json({status: false, message: 'The city was not found'});
        } else {
            const store = new db.Store({
                name,
                _cityId: city_id,
                delivery_time,
                tags
            });

            db.Store.create(store, (err, created) => {
                if (err) {
                    res.status(500).json({status: false, message: 'An error while creating the store'});
                } else {
                    res.status(200).json({status: true, message: 'Created the store successfully', data: created});
                }
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

storeController.allStores = (req, res) => {
    db.Store.find().then(stores => {
        if (stores === undefined || stores.length === 0) {
            res.status(404).json({status: false, message: 'No store was found'});
        } else {
            res.status(200).json({status: true, message: 'Found', data: stores});
        }
    }).catch(err => res.status(500).json({status: false, message: err.message}));
};

storeController.editStore = (req, res) => {
    const {store_id, name, delivery_time, tags} = req.body;
    db.Item.findOneAndUpdate({_id: store_id}, {$set: {name, delivery_time, tags}}, {new: true}, (err, updated) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully updated the store', data: updated});
        }
    });
};

storeController.deleteStore = (req, res) => {
    const id = req.params.id;
    db.Store.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully deleted this store', data: deleted});
        }
    });
};

storeController.addCategory = (req, res) => {
    const {store_id, category_id} = req.body;

    db.Store.findById(store_id).then(store => {
        if (store === undefined) {
            res.status(404).json({status: false, message: 'The store was not found'});
        } else {
            store.categories.push(category_id);
            store.save().then(saved => {
                res.status(200).json({status: true, message: 'Added category', data: saved});
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

export default storeController;