import db from '../models';

const cityController = {};

cityController.createCity = (req, res) => {
    const {name, image, coordinates} = req.body;
    
    const city = new db.City({
        name,
        image,
        coordinates
    });

    db.City.create(city, (err, created) => {
        if (err) {
            res.status(500).json({status: false, message: 'An error occured while creating the city'});
        } else {
            res.status(200).json({status: true, message: 'Created', data: created});
        }
    });
};

cityController.addStore = (req, res) => {
    const {city_id, store_id} = req.body;

    db.City.findById(city_id).then(city => {
        if (city === null) {
            res.status(404).json({status: false, message: 'City not found'});
        } else {
            city.stores.push(store_id);
            city.save().then(saved => {
                res.status(200).json({status: true, message: 'Successfully added the city', data: saved});
            });
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

cityController.allCities = (req, res) => {
    db.City.find().then(cities => {
        if (cities === null || cities.length === 0) {
            res.status(404).json({status: false, message: 'No cities were found'});
        } else {
            res.status(200).json({status: true, message: 'Found all cities', data: cities});
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

cityController.fetchCity = (req, res) => {
    const cityId = req.params.cityId;
    db.City.findById(cityId).populate('stores').then(city => {
        if (city === null) {
            res.status(404).json({status: false, message: 'The city with this id was not found'});
        } else {
            res.status(200).json({status: true, message: 'Found', data: city});
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

cityController.removeStore = (req, res) => {
    const {city_id, store_id} = req.body;

    db.City.findById(city_id).then(city => {
        if (city === null) {
            res.status(404).json({status: false, message: 'The city was not found'});
        } else {
            const idx = city.stores.indexOf(store_id);
            if (idx !== -1) {
                city.stores.splice(idx, 1);
            }
            res.status(200).json({status: true, message: 'The store has been successfully removed', data: city});
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

cityController.editCity = (req, res) => {
    const {city_id, image, name, coordinates} = req.body;
    db.Item.findOneAndUpdate({_id: city_id}, {$set: {name, image, coordinates}}, {new: true}, (err, updated) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully updated the city', data: updated});
        }
    });
};

cityController.deleteCity = (req, res) => {
    const id = req.params.id;
    db.City.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({status: false, message: err.message});
        } else {
            res.status(200).json({status: true, message: 'Successfully deleted this city', data: deleted});
        }
    });
};

cityController.getAllTopCategories = (req, res) => {
    const cityId = req.params.cityId;
    db.City.findById(cityId).populate({path: 'stores', model: 'Store', populate: {
        path: 'top_categories',
        model: 'TopCategories'
    }}).then(city => {
        if (city === null) {
            res.status(404).json({status: false, message: 'The city was not found'});
        } else {
            if (city.stores.length === 0) {
                res.status(401).json({status: false, message: 'There are no stores in this city'});
            } else {
                res.status(200).json({status: false, message: 'Found', data: city.stores[0].top_categories});
            }
        }
    }).catch(err => {
        res.status(500).json({status: false, message: err.message});
    });
};

export default cityController;