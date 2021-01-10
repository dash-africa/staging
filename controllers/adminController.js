import db from '../models';
import bcrypt from 'bcryptjs';
import { signUser } from './../utils';

const adminController = {};

adminController.register = (req, res) => {
    const { email, password } = req.body;

    db.Admin.findOne({ email: email }).then((adm) => {
        if (adm !== null) {
            // The account already exists
            res.status(409).json({ status: false, message: "Admin already exists" });
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        res.status(500).json({ status: false, message: 'There was an error setting up your password' });
                    } else {
                        const admin = new db.Admin({
                            email,
                            password: hash
                        });
                        admin.save().then((saved) => {
                            res.status(200).json({ status: true, message: 'The admin account has been created' });
                        });
                    }
                });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

adminController.login = (req, res) => {
    const { email, password } = req.body;

    db.Admin.findOne({ email: email }).then(admin => {
        if (!admin) {
            res.status(404).json({ status: false, message: 'The admin account was not found' });
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    bcrypt.compare(password, admin.password, function (err, response) {
                        if (response === true) {
                            signUser(admin._id).then((token) => {
                                res.status(200).json({ status: true, message: "Admin logged in succesfully", token });
                            }).catch((err) => {
                                res.status(500).json({ status: false, message: err.message });
                            });
                        } else {
                            res.status(400).json({ status: false, message: 'Wrong login details' });
                        }
                    });
                });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

adminController.verifyDriver = (req, res) => {
    const { driver_id, email } = req.body;

    db.Admin.findOne({ email: email }).then(admin => {
        if (!admin) {
            res.status(404).json({ status: false, message: 'The admin account was not found' });
        } else {
            db.Driver.findById(driver_id).then(driver => {
                if (!driver) {
                    res.status(404).json({ status: false, message: 'The driver account was not found' });
                } else {
                    driver.is_verified = true;
                    driver.save().then(verified => {
                        res.status(200).json({ status: true, message: 'The driver has been successfully verified', data: verified });
                    }).catch(err => {
                        res.status(500).json({ status: false, message: err.message });
                    });
                }
            }).catch(err => {
                res.status(500).json({ status: false, message: err.message });
            });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

adminController.deleteDriver = (req, res) => {
    const id = req.params.id;
    db.Driver.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            res.status(500).json({ status: false, message: err.message });
        } else {
            res.status(200).json({ status: true, message: 'Successfully deleted this driver', data: deleted });
        }
    });
};

export default adminController;