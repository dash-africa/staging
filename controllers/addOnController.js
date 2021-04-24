import db from '../models';

const addOnController = {};

addOnController.create = (req, res) => {
    const { name, isRequired, isFree, canBuyMultiple, items } = req.body;

    const addOn = new db.AddOns({
        name,
        isRequired,
        isFree,
        canBuyMultiple,
        items
    });

    db.AddOns.create(addOn, (err, created) => {
        if (err) {
            res.status(500).json({ status: false, message: 'An error occured while creating the add-on' });
        } else {
            res.status(200).json({ status: true, message: 'Created', data: created });
        }
    });
};

addOnController.addItem = (req, res) => {
    const { addOn_id, item_id } = req.body;

    db.AddOns.findById(addOn_id).then(addOn => {
        if (!addOn || !addOn.length) {
            res.status(404).json({ status: false, message: 'Add-On not found' });
        } else {
            addOn.items.push(item_id);
            addOn.save().then(saved => {
                res.status(200).json({ status: true, message: 'Successfully added the item', data: saved });
            });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

addOnController.allAddOns = (req, res) => {
    db.AddOns.find().populate('items').then(addOns => {
        if (addOns === null || addOns.length === 0) {
            res.status(404).json({ status: false, message: 'No addOns were found' });
        } else {
            res.status(200).json({ status: true, message: 'Found all addOns', data: addOns });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

addOnController.fetchAddOn = (req, res) => {
    const addOnId = req.params.id;
    db.AddOns.findById(addOnId).populate('items').then(addOn => {
        if (!addOn) {
            res.status(404).json({ status: false, message: 'The add-on was not found' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: addOn });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

addOnController.removeItem = (req, res) => {
    const { addOn_id, item_id } = req.body;

    db.AddOns.findById(addOn_id).then(addOn => {
        if (!addOn) {
            res.status(404).json({ status: false, message: 'The add-on was not found' });
        } else {
            const idx = addOn.items.indexOf(item_id);
            if (idx !== -1) addOn.items.splice(idx, 1);

            addOn.save().then(saved => {
                res.status(200).json({ status: true, message: 'The item has been successfully removed', data: addOn });
            });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

addOnController.editAddOn = (req, res) => {
    const { addOn_id, name, isRequired, isFree, canBuyMultiple, items } = req.body;
    db.AddOns.findOneAndUpdate({ _id: addOn_id }, { $set: { name, isRequired, isFree, canBuyMultiple, items } }, { new: true }, (err, updated) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully updated the add-on', data: updated });
        }
    });
};

addOnController.delete = (req, res) => {
    const id = req.params.id;
    db.AddOns.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully deleted the add-on', data: deleted });
        }
    });
}

export default addOnController;