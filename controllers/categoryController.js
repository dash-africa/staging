import db from '../models';

const categoryController = {};

categoryController.createCategory = (req, res) => {
    const {name, store_id} = req.body;

    db.Store.findById(store_id).then(store => {
        if (store === null) {
            res.status(404).json({status: false, message: 'The store was not found'});
        } else {
            const category = new db.Category({
                name,
                _storeId: store_id
            });

            db.Category.create(category, (err, stored) => {
                if (err) {
                    res.status(500).json({status: false, message: 'An error occured while creating the category'});
                } else {
                    res.status(200).json({status: true, message: 'Created the category', data: stored});
                }
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

categoryController.addItem = (req, res) => {
    const {category_id, item_id} = req.body;

    db.Category.findById(category_id).then(category => {
        if (category === null) {
            res.status(404).json({status: false, message: 'The category was not found'});
        } else {
            db.Item.findById(item_id).then(item => {
                if (item === null) {
                    res.status(404).json({status: false, message: 'The item was not found'});
                } else {
                    category.items.push(item._id);
                    category.save().then(saved => {
                        res.status(200).json({status: true, message: 'The item has been added to the category', data: saved});
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

categoryController.allCategories = (req, res) => {
    db.Category.find().then(categories => {
        if (categories === null || categories.length === 0) {
            res.status(404).json({status: false, message: 'No item was found'});
        } else {
            res.status(200).json({status: true, message: 'Found', data: categories});
        }
    }).catch(err => res.status(500).json({status: false, message: err.message}));
};

categoryController.editCategory = (req, res) => {
    const {category_id, name} = req.body;
    db.Category.findOneAndUpdate({_id: category_id}, {$set: {name}}, {new: true}, (err, updated) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully updated the category', data: updated});
        }
    });
};

categoryController.deleteCategory = (req, res) => {
    const id = req.params.id;
    db.Category.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully deleted this category', data: deleted});
        }
    });
};

categoryController.removeItem = (req, res) => {
    const {category_id, item_id} = req.body;
    db.Category.findById(category_id).then(category => {
        if (category === null) {
            res.status(404).json({status: false, message: 'The category was not found'});
        } else {
            const idx = category.items.indexOf(item_id);
            if (idx !== -1) {
                category.items.splice(idx, 1);
            }
            res.status(200).json({status: false, message: 'Successfully removed the item from the category', data: category});
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

export default categoryController;