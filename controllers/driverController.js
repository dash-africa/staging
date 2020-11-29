import db from '../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import controllers from './index';

import { google } from 'googleapis';
import crypto from 'crypto';
import authenticator from 'otplib/authenticator';

authenticator.options = {
    crypto
};

const driverController = {};

const secret = process.env.SECRET;

let sendMail = (dir_path, object) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname, '../templates/' + dir_path), object, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

let signUser = (user) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ user: user }, process.env.SECRET_KEY, { expiresIn: '1yr' }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

driverController.register = (req, res) => {
    const { firstname, lastname, address, email, phone, password, drivers_license, front_id_card, back_id_card, bank, account_number, photo, mode_of_transportation } = req.body;

    db.Driver.findOne({ $or: [{  phone: phone }, { email: email }] }).then((d) => {
        if (!d) {
            res.status(409).json({ status: false, message: "Driver already exists" });
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        res.status(500).json({ status: false, message: 'There was an error setting up your password' });
                    } else {
                        const driver = new db.Driver({
                            firstname,
                            lastname,
                            address,
                            email,
                            password: hash,
                            phone,
                            drivers_license,
                            front_id_card,
                            back_id_card,
                            bank,
                            account_number,
                            photo,
                            mode_of_transportation
                        });
                        const otp = authenticator.generate(secret);
                        driver.save().then((courier) => {
                            const tokenise = new db.Token({
                                _userId: courier._id,
                                token: otp
                            });

                            tokenise.save((err) => {
                                if (err) { return res.status(500).send({ msg: err.message }); }

                                // Send the email
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    host: 'smtp.gmail.com',
                                    auth: {
                                        user: process.env.GMAIL_USERNAME,
                                        pass: process.env.GMAIL_PASSWORD
                                    }
                                });
                                // const mailOptions = { from: 'kana-insight@yourwebapplication.com', to: User.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' + req.headers.host + '\/confirmation\/' + tokenise.token + '.\n' };

                                sendMail('verification.ejs', { lastname: courier.lastname, token: tokenise.token, host: req.headers.host, protocol: req.protocol }).then(data => {
                                    const mailOptions = {
                                        from: 'dash@yourwebapplication.com',
                                        to: courier.email,
                                        subject: 'Account Verification Token',
                                        html: data
                                    };

                                    transporter.sendMail(mailOptions, (err) => {
                                        if (err) {
                                            return res.status(500).send({
                                                msg: err.message
                                            });
                                        }
                                        res.status(200).json({
                                            status: true,
                                            message: 'A verification email has been sent to ' + courier.email + '.',
                                            token: tokenise.token,
                                            data: courier.email
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
        }
    });
};

driverController.login = (req, res) => {
    const { email, password } = req.body;
    db.Driver.findOne({ email: email }).then((driver) => {
        if (driver) {
            // The driver has registered
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    bcrypt.compare(password, user.password, function (err, response) {
                        if (response === true) {
                            // Check if the user is verified
                            if (!driver.is_verified && !driver.is_email_verified && !driver.is_phone_verified) {
                                res.status(401).json({ status: false, message: 'This account has not been verified' });
                            } else {
                                signUser(user._id).then((token) => {
                                    res.status(200).json({ status: true, message: "Driver logged in succesfully", data: user, token });
                                }).catch((err) => {
                                    res.status(500).json({ status: false, message: err.message });
                                });
                            }
                        } else {
                            res.status(400).json({ status: false, message: 'Wrong login details' });
                        }
                    });
                });
            });
        } else {
            res.status(400).json({ status: false, message: 'Wrong login details' });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

driverController.confirmationPost = (req, res) => {
    const { email, token } = req.body;

    // Look for the token with the jwt saved in the localstorage
    db.Token.findOne({ token }).then(tokens => {
        // Check if token has expired
        if (tokens) {
            // Token has been found, now confirmation begins
            // Find the user with that token
            db.Driver.findOne({ _id: tokens._userId, email: email }).then(driver => {
                // Check of driver is found
                if (driver) {
                    if (driver.is_email_verified) {
                        res.status(400).json({ status: false, message: 'This driver has already been verified' });
                    } else {
                        driver.is_email_verified = true;
                        driver.save().then(courier => {
                            signUser(courier._id).then((token) => {
                                res.status(200).json({ status: true, message: "The driver's account has been verified", data: courier, token });
                            }).catch((err) => {
                                res.status(500).json({ status: false, message: err.message });
                            });
                        }).catch(err => {
                            res.status(500).json({ status: false, message: err.message });
                        });
                    }
                } else {
                    res.status(400).json({ status: false, message: 'We were unable to find a driver for this token.' });
                }
            }).catch(err => {
                res.status(500).json({ status: false, message: 'Unable to find the account this token is linked to' })
            });
        } else {
            res.status(400).json({ status: false, message: 'We were unable to find a valid token. Your token may have expired.' });
        }
    }).catch(err => { res.status(500).json({ status: false, message: err.message }); });
};

driverController.getAllDrivers = (req, res) => {
    db.Driver.find().then(drivers => {
        if (!drivers || !drivers.length) {
            res.status(404).json({ status: false, message: 'No driver is in the database', data: [] });
        } else {
            res.status(200).json({ status: true, message: 'All drivers have been gotten', data: drivers });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.mesaage }));
};

driverController.resendTokenPost = (req, res) => {
    const { email, token } = req.body;
    // Check user with the email
    db.Driver.findOne({ email }).then(driver => {
        // Check if user returned is not null
        if (driver) {
            // Generate jwt for email confirmation token
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASSWORD
                }
            });

            sendMail('verification.ejs', { lastname: driver.lastname, token, host: req.headers.host, protocol: req.protocol }).then(data => {
                const mailOptions = {
                    from: 'dash@yourwebapplication.com',
                    to: user.email,
                    subject: 'Account Verification Token',
                    html: data
                };

                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        return res.status(500).send({
                            msg: err.message
                        });
                    }
                    res.status(200).json({
                        status: true,
                        message: 'A verification email has been sent to ' + driver.email + '.',
                        token: token,
                        data: driver.email
                    });
                });
            });
        } else {
            res.status(401).json({ status: false, mesaage: 'The driver is not found, please enter a registered email' });
        }
    });
};

driverController.resendForgottenToken = (req, res) => {
    const { email } = req.body;
    // Check user with the email
    db.Driver.findOne({ email }).then(driver => {
        if (driver) {
            // Save new token in the database
            const otp = authenticator.generate(secret);
            const tokenise = new db.Token({
                _userId: driver._id,
                token: otp
            });
            tokenise.save(err => {
                // If there is an error when saving the token
                if (err) { return res.status(500).send({ msg: err.message }); }

                // If no error is generated
                // Send the confirmation email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    auth: {
                        user: process.env.GMAIL_USERNAME,
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                sendMail('forgotten.ejs', { lastname: driver.lastname, token: tokenise.token, host: req.headers.host, protocol: req.protocol }).then(data => {
                    const mailOptions = {
                        from: 'dash@yourwebapplication.com',
                        to: user.email,
                        subject: 'Forgotten Password Token',
                        html: data
                    };

                    transporter.sendMail(mailOptions, (err) => {
                        if (err) {
                            return res.status(500).send({
                                msg: err.message
                            });
                        }
                        res.status(200).json({
                            status: true,
                            message: 'A verification email has been sent to ' + driver.email + '.',
                            token: tokenise.token,
                            data: driver.email
                        });
                    });
                });
            });
        } else {
            res.status(401).json({ status: false, message: 'The driver is not found, please enter a registered email' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

driverController.sendOtpToPhone = (req, res) => {
    const { phone, recaptchaToken } = req.body;

    db.Driver.findOne({ phone }).then(driver => {
        if (driver) {
            const identityToolkit = google.identitytoolkit({
                auth: process.env.GOOGLE_SERVER_APIKEY,
                version: 'v3',
            });

            identityToolkit.relyingparty.sendVerificationCode({
                phone,
                recaptchaToken
            }).then(response => {
                // save sessionInfo into db. You will need this to verify the SMS code
                driver.session_token = response.data.sessionInfo;
                driver.save(err => {
                    // If there is an error when saving the driver
                    if (err) { return res.status(500).send({ msg: err.message }); };

                    // If successful
                    res.status(200).json({ status: true, message: 'Successfully sent otp' });
                });
            });
        } else {
            res.status(401).json({ status: false, mesaage: 'The driver with this phone number is not found' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

driverController.verifyPhoneNumber = (req, res) => {
    const { phone, verificationCode } = req.body;

    db.Driver.findOne({ phone }).then(driver => {
        if (driver) {
            const identityToolkit = google.identitytoolkit({
                auth: process.env.GOOGLE_SERVER_APIKEY,
                version: 'v3',
            });

            identityToolkit.relyingparty.verifyPhoneNumber({
                code: verificationCode,
                sessionInfo: driver.session_token,
            }).then(response => {
                driver.is_phone_verified = true;
                driver.save(err => {
                    // If there is an error when saving the driver
                    if (err) { return res.status(500).send({ msg: err.message }); };

                    // If successful
                    res.status(200).json({ status: true, message: 'Driver phone number have been verified' });
                });
            });
        } else {
            res.status(401).json({ status: false, mesaage: 'The driver with this phone number is not found' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

driverController.changePassword = (req, res) => {
    const { email, password, token } = req.body;

    // Check the sent token first
    db.Token.findOne({ token }).then(tokens => {
        if (tokens) {
            // Find the driver with email
            db.Driver.findOne({ _id: tokens._userId, email: email }).then(driver => {
                if (driver) {
                    // Hash the password
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            driver.password = hash;
                            driver.save(err => {
                                // If there is an error when saving the driver
                                if (err) { return res.status(500).send({ msg: err.message }); };

                                // If successful
                                res.status(200).json({ status: true, message: 'The password has been successfully changed' });
                            });
                        });
                    });
                } else {
                    res.status(401).json({ status: false, mesaage: 'The driver is not found, please enter a registered email' });
                }
            });
        } else {
            res.status(400).json({ status: false, message: 'We were unable to find a valid token. Your token my have expired.' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

driverController.getDriverInfo = (req, res) => {
    // Find Driver
    db.Driver.findById(req.user).then(driver => {
        if (driver) {
            res.status(200).json({ status: true, message: 'Found', data: driver });
        } else {
            res.status(404).json({ status: false, message: 'This driver was not found' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

export default driverController;