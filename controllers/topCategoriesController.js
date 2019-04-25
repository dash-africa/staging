import db from './../models';

const topCategoriesController = {};

topCategoriesController.create = (req, res) => {
    const {storeId, name, image} = req.body;
    db.Store.findById(storeId).then(store => {
        if (store === null) {
            res.status(404).json({status: false, message: 'Store not found'});
        } else {
            const topCat = new db.TopCategories({
                name,
                image,
                store: storeId
            });

            db.TopCategories.create(topCat, (err, saved) => {
                if (err) {
                    res.status(500).json({status: false, message: err.message});
                } else {
                    store.top_categories.push(saved._id);
                    store.save().then(done => {
                        res.status(200).json({status: true, message: 'Successfully created the top category'});
                    });
                }
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

export default topCategoriesController;