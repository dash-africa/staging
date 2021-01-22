import jwt from 'jsonwebtoken';
import db from '../models';

function verifyToken(req, res, next) {
    // GET THE AUTH HEADER VALUE
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data) => {
            if (data) {
                db.User.findById(data.user).then((user) => {
                    if (user) {
                        req.user = data.user;
                        next();
                    } else {
                        res.status(403).json({ status: false, message: 'Unauthorized' });
                    }
                }).catch((err) => {
                    if (err) { res.status(403).json({ status: false, message: 'Unauthorized' }); }
                });
            } else {
                res.status(403).json({ status: false, message: 'Unauthorized' });
            }
        });
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}

function verifyDriverToken(req, res, next) {
    // GET THE AUTH HEADER VALUE
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data) => {
            if (data) {
                db.Driver.findById(data.user).then((user) => {
                    if (user) {
                        req.user = data.user;
                        next();
                    } else {
                        res.status(403).json({ status: false, message: 'Unauthorized' });
                    }
                }).catch((err) => {
                    if (err) { res.status(403).json({ status: false, message: 'Unauthorized' }); }
                });
            } else {
                res.status(403).json({ status: false, message: 'Unauthorized' });
            }
        });
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}

function verifyAdminToken(req, res, next) {
    // GET THE AUTH HEADER VALUE
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // verify jwt
        jwt.verify(bearerHeader, process.env.SECRET_KEY, (err, data) => {
            if (data) {
                db.Admin.findById(data.user).then((user) => {
                    if (user) {
                        req.user = data.user;
                        next();
                    } else {
                        res.status(403).json({ status: false, message: 'Unauthorized' });
                    }
                }).catch((err) => {
                    if (err) { res.status(403).json({ status: false, message: 'Unauthorized' }); }
                });
            } else {
                res.status(403).json({ status: false, message: 'Unauthorized' });
            }
        });
    } else {
        //forbiden
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
}

export { verifyToken, verifyDriverToken, verifyAdminToken };
