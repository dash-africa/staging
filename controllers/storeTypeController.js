import db from '../models';

const storeTypeController = {};

storeTypeController.create = (req, res) => {
    const { name, image } = req.body;

    const storeType = new db.StoreType({
        name,
        image
    });

    db.StoreType.create(storeType, (err, created) => {
        if (err) {
            res.status(500).json({ status: false, message: 'An error occured while creating the store type' });
        } else {
            res.status(200).json({ status: true, message: 'Created', data: created });
        }
    });
};

storeTypeController.all = (req, res) => {
    db.StoreType.find().then(storeTypes => {
        if (storeTypes === null || storeTypes.length === 0) {
            res.status(404).json({ status: false, message: 'No store type was not found' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: storeTypes });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

storeTypeController.edit = (req, res) => {
    const { storeType_id, name, image } = req.body;
    db.StoreType.findOneAndUpdate({ _id: storeType_id }, { $set: { name, image } }, { new: true }, (err, updated) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully updated the store type', data: updated });
        }
    });
};

storeTypeController.delete = (req, res) => {
    const id = req.params.id;
    db.StoreType.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully deleted this store type', data: deleted });
        }
    });
};

storeTypeController.addStore = (req, res) => {
    const { storeType_id, store_id } = req.body;

    db.StoreType.findById(storeType_id).then(storeType => {
        if (storeType === null) {
            res.status(404).json({ status: false, message: 'The store type was not found' });
        } else {
            storeType.stores.push(store_id);
            storeType.save().then(saved => {
                res.status(200).json({ status: true, message: 'Added store', data: saved });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

storeTypeController.getStores = (req, res) => {
    db.StoreType.findById(req.params.storeType_id).populate('stores').then(storeType => {
        if (storeType === null) {
            res.status(404).json({ status: false, message: 'No store was found' });
        } else {
            res.status(200).json({ status: true, message: 'Gotten stores', data: storeType });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

export default storeTypeController;