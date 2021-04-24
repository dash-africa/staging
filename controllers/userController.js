import db from '../models';
import bcrypt from 'bcryptjs';
import { google } from 'googleapis';
import crypto from 'crypto';
import authenticator from 'otplib/authenticator';
import { sendMail, signUser, transporter, removeItem, createRefund } from './../utils';
import { OrderStatus } from './../constants';
import controllers from '.';

authenticator.options = {
    crypto
};

const userController = {};
const secret = process.env.SECRET;


userController.registerUser = (req, res) => {
    const { firstname, lastname, email, password, phone } = req.body;

    db.User.findOne({ $or: [{ phone: phone }, { email: email }] }).then((u) => {
        if (u !== null) {
            // This user already exists
            res.status(409).json({ status: false, message: "User already exists" });
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        res.status(500).json({ status: false, message: 'There was an error setting up your password' });
                    } else {
                        const user = new db.User({
                            firstname,
                            lastname,
                            email,
                            password: hash,
                            phone,
                        });
                        const otp = authenticator.generate(secret);
                        user.save().then((User) => {
                            const tokenise = new db.Token({
                                _userId: User._id,
                                token: otp
                            });

                            tokenise.save((err) => {
                                if (err) { return res.status(500).send({ msg: err.message }); }

                                // Send the email
                                sendMail('verification.ejs', { lastname: User.lastname, token: tokenise.token, host: req.headers.host, protocol: req.protocol }).then(async data => {
                                    const mailOptions = {
                                        from: 'dashdeliveryapp@gmail.com',
                                        to: User.email,
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
                                            message: 'A verification email has been sent to ' + User.email + '.',
                                            token: tokenise.token,
                                            data: User.email
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

userController.loginUser = (req, res) => {
    const { email, password } = req.body;
    // console.log(req.protocol);
    db.User.findOne({ email: email }).then((user) => {
        if (user !== null) {
            // The user has registered
            // Check user password against the hashed
            bcrypt.compare(password, user.password, function (err, response) {
                if (response === true) {
                    // Check if the user is verified
                    if (user.is_verified === false) {
                        res.status(401).json({ status: false, message: 'This account has not been verified' });
                    } else {
                        const data = {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            phone: user.phone,
                            is_verified: user.is_verified,
                            is_phone_verified: user.is_phone_verified,
                            _id: user._id
                        };

                        signUser(user._id).then((token) => {
                            res.status(200).json({ status: true, message: "User logged in succesfully", data, token });
                        }).catch((err) => {
                            res.status(500).json({ status: false, message: err.message });
                        });
                    }
                } else {
                    res.status(400).json({ status: false, message: 'Wrong login details' });
                }
            });
        } else {
            res.status(400).json({ status: false, message: 'Wrong login details' });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
};

userController.confirmationPost = (req, res) => {
    const { email, token } = req.body;
    // console.log(authenticator.check(token, secret));

    // Look for the token with the jwt saved in the localstorage
    db.Token.findOne({ token }).then(tokens => {
        // Check if token has expired
        if (tokens !== null) {
            // Token has been found, now confirmation begins
            // Find the user with that token
            db.User.findOne({ _id: tokens._userId, email: email }).then(user => {
                // Check of user is found
                if (user !== null) {
                    if (user.is_verified) {
                        res.status(400).json({ status: false, message: 'This user has already been verified' });
                    } else {
                        user.is_verified = true;
                        user.save().then(User => {
                            signUser(User._id).then((token) => {
                                res.status(200).json({ status: true, message: "The user's account has been verified", data: User, token });
                            }).catch((err) => {
                                res.status(500).json({ status: false, message: err.message });
                            });
                        }).catch(err => {
                            res.status(500).json({ status: false, message: err.message });
                        });
                    }
                } else {
                    // Not user
                    res.status(400).json({ status: false, message: 'We were unable to find a user for this token.' });
                }
            }).catch(err => {
                res.status(500).json({ status: false, message: 'Unable to find the account this token is linked to' })
            });
        } else {
            res.status(400).json({ status: false, message: 'We were unable to find a valid token. Your token may have expired.' });
        }
    }).catch(err => { res.status(500).json({ status: false, message: err.message }); });
};

userController.getAllUsers = (req, res) => {
    db.User.find().then(users => {
        if (users === null) {
            res.status(404).json({ status: false, message: 'No user is in the database', data: [] });
        } else {
            res.status(200).json({ status: true, message: 'All users have been gotten', data: users });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.mesaage }));
};

userController.resendTokenPost = (req, res) => {
    const { email, token } = req.body;
    // Check user with the email
    db.User.findOne({ email }).then(user => {
        // Check if user returned is not null
        if (user !== null) {
            // Generate jwt for email confirmation token
            sendMail('verification.ejs', { lastname: user.lastname, token, host: req.headers.host, protocol: req.protocol }).then(async data => {
                const mailOptions = {
                    from: 'dashdeliveryapp@gmail.com',
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
                        message: 'A verification email has been sent to ' + user.email + '.',
                        token: token,
                        data: user.email
                    });
                });
            });
        } else {
            res.status(401).json({ status: false, mesaage: 'The user is not found, please enter a registered email' });
        }
    });
};

userController.resendForgottenToken = (req, res) => {
    const { email } = req.body;
    // Check user with the email
    db.User.findOne({ email }).then(user => {
        // Check if user returned is not null
        if (user !== null) {
            // Save new token in the database
            const otp = authenticator.generate(secret);
            const tokenise = new db.Token({
                _userId: user._id,
                token: otp
            });
            tokenise.save(err => {
                // If there is an error when saving the token
                if (err) { return res.status(500).send({ msg: err.message }); }

                // If no error is generated
                // Send the confirmation email

                sendMail('forgotten.ejs', { lastname: user.lastname, token: tokenise.token, host: req.headers.host, protocol: req.protocol }).then(async data => {
                    const mailOptions = {
                        from: 'dashdeliveryapp@gmail.com',
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
                            message: 'A verification email has been sent to ' + user.email + '.',
                            token: tokenise.token,
                            data: user.email
                        });
                    });
                });
            });
        } else {
            res.status(401).json({ status: false, message: 'The user is not found, please enter a registered email' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

userController.sendOtpToPhone = (req, res) => {
    const { phone, recaptchaToken } = req.body;

    db.User.findOne({ phone }).then(user => {
        if (user !== null) {
            const identityToolkit = google.identitytoolkit({
                auth: process.env.GOOGLE_SERVER_APIKEY,
                version: 'v3',
            });

            identityToolkit.relyingparty.sendVerificationCode({
                phone,
                recaptchaToken
            }).then(response => {
                // save sessionInfo into db. You will need this to verify the SMS code
                user.session_token = response.data.sessionInfo;
                user.save(err => {
                    // If there is an error when saving the user
                    if (err) { return res.status(500).send({ msg: err.message }); };

                    // If successful
                    res.status(200).json({ status: true, message: 'Successfully sent otp' });
                });
            });
        } else {
            res.status(401).json({ status: false, mesaage: 'The user with this phone number is not found' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

userController.verifyPhoneNumber = (req, res) => {
    const { phone, verificationCode } = req.body;

    db.User.findOne({ phone }).then(user => {
        if (user !== null) {
            const identityToolkit = google.identitytoolkit({
                auth: process.env.GOOGLE_SERVER_APIKEY,
                version: 'v3',
            });

            identityToolkit.relyingparty.verifyPhoneNumber({
                code: verificationCode,
                sessionInfo: user.session_token,
            }).then(response => {
                user.is_phone_verified = true;
                user.save(err => {
                    // If there is an error when saving the user
                    if (err) { return res.status(500).send({ msg: err.message }); };

                    // If successful
                    res.status(200).json({ status: true, message: 'User phone number have been verified' });
                });
            });
        } else {
            res.status(401).json({ status: false, mesaage: 'The user with this phone number is not found' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
};

userController.changePassword = (req, res) => {
    const { email, password, token } = req.body;

    // Check the sent token first
    db.Token.findOne({ token }).then(tokens => {
        if (tokens) {
            // Find the user with email
            db.User.findOne({ _id: tokens._userId, email: email }).then(user => {
                if (user !== null) {
                    // Hash the password
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            user.password = hash;
                            user.save(err => {
                                // If there is an error when saving the user
                                if (err) { return res.status(500).send({ msg: err.message }); };

                                // If successful
                                res.status(200).json({ status: true, message: 'The password has been successfully changed' });
                            });
                        });
                    });
                } else {
                    res.status(401).json({ status: false, mesaage: 'The user is not found, please enter a registered email' });
                }
            });
        } else {
            res.status(400).json({ status: false, message: 'We were unable to find a valid token. Your token my have expired.' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.getUserInfo = (req, res) => {
    // Find User
    db.User.findById(req.user).then(user => {
        if (user !== null) {
            res.status(200).json({ status: true, message: 'Found', data: user });
        } else {
            res.status(404).json({ status: false, message: 'This user was not found' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.fetchUserCart = (req, res) => {
    db.User.findById(req.user).populate('carts').then(user => {
        if (!user) {
            res.status(404).json({ status: false, message: 'User not found' })
        } else {
            res.status(200).json({ status: true, message: 'Found', data: user.carts });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

userController.fetchUserCards = (req, res) => {
    db.User.findById(req.user).populate('cards', ['card_type', 'last4']).then(user => {
        if (user === null) {
            res.status(404).json({ status: false, message: 'User not found' })
        } else {
            res.status(200).json({ status: true, message: 'Found', data: user.cards });
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

userController.getAllOrders = (req, res) => {
    db.User.findById(req.user).populate({
        path: 'history', model: 'History', populate: [{
            path: 'items',
            model: 'Item'
        },{
            path: 'store',
            model: 'Store'
        }]
    }).then(user => {
        if (user !== null) {
            res.status(200).json({ status: true, message: 'Found', data: user.history });
        } else {
            res.status(404).json({ status: false, message: 'This user has no orders' });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.getAllPendingOrders = (req, res) => {
    db.History.find({ user: req.user, status: 'new' }).populate(['items', 'store']).then(history => {
        if (!history) {
            res.status(404).json({ status: false, message: 'This user has no pending orders' });
        } else {
            res.status(200).json({ status: true, message: 'Found', data: history });
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.completeOrder = (req, res) => {
    const { orderId } = req.body;
    const status = OrderStatus.COMPLETED;

    db.User.findById(req.user).then(user => {
        if (!user) {
            res.status(404).json({ status: false, message: 'This user was not found' });
        } else {
            if (user.new_order_firebase_uid.includes(orderId)) {
                controllers.firebaseController.changeStatus(orderId, null, status).then(firebaseObj => {
                    if (firebaseObj) {
                        db.History.findById(firebaseObj.history_id).then(history => {
                            if (!history) {
                                res.status(404).json({ status: false, message: 'Could not find history to this order' });
                            } else {
                                history.status = status;    
    
                                history.save().then(saved => {
                                    // Find driver and give earnings
                                    db.Driver.findById(firebaseObj.driverId).then(driver => {
                                        if (!driver) {
                                            res.status(404).json({ status: false, message: 'Could not find driver assigned to this order' });
                                        } else {
                                            driver.successful_deliveries += 1;
                                            driver.overall_earnings += firebaseObj.delivery_fee;

                                            driver.save(driverSaved => {
                                                // Create earning for driver
                                                const earning = new db.Earning({
                                                    driver,
                                                    amount: firebaseObj.delivery_fee,
                                                    history,
                                                });

                                                earning.save().then(earningSaved => {
                                                    // remove order from user's list of new orders
                                                    removeItem(user.new_order_firebase_uid, orderId);
                                                    user.save(userSaved => {
                                                        // delete firebase entry and completed process
                                                        controllers.firebaseController.deleteEntry(orderId).then(removed => {
                                                            if (removed) {
                                                                res.status(200).json({ status: true, message: 'Order has been completed by the user' });
                                                            } else {
                                                                res.status(500).json({ status: false, message: 'Firebase failed to remove entry' });
                                                            }
                                                        }).catch(err => res.status(500).json({ status: false, message: err.message }));
                                                    });
                                                });

                                            });
                                        }
                                    }).catch(err => res.status(500).json({ status: false, message: err.message }));
                                });
                            }
                        }).catch(err => res.status(500).json({ status: false, message: err.message }));
                    } else {
                        res.status(500).json({ status: false, message: 'Internal Server Error' });
                    }
                }).catch(err => res.status(500).json({ status: false, message: err.message }));
            } else {
                res.status(404).json({ status: false, message: 'This order does not belong to this user' });
            }
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.rateDriver = (req, res) => {
    const { driverId, rating } = req.body;

    db.User.findById(req.user).then(user => {
        if (!user) {
            res.status(404).json({ status: false, message: 'This user was not found' });
        } else {
            db.Driver.findById(driverId).then(driver => {
                if (!driver) {
                    res.status(404).json({ status: false, message: 'Driver with this id was not found' });
                } else {
                    driver.overall_rating += rating;
                    driver.number_of_ratings += 1;
                    driver.last_rating = rating;
                    driver.average_rating = driver.overall_rating / driver.number_of_ratings;

                    driver.save().then(driverSaved => {
                        res.status(200).json({ status: true, message: 'User has succcessfully rated driver' });
                    })
                }
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.cancelOrder = (req, res) => {
    const { historyId } = req.body;

    db.User.findById(req.user).then(user => {
        if (!user) {
            res.status(404).json({ status: false, message: 'This user was not found' });
        } else {
            db.History.findById(historyId).then(async history => {
                if (!history) {
                    res.status(404).json({ status: false, message: 'Order history was not found' });
                } else {
                    if (history.status !== 'new') {
                        res.status(401).json({ status: false, message: 'User cannot cancel this order since it is being processed' })
                    } else {
                        const response = await createRefund(history.paymentRef);
    
                        if (response.status) {
                            removeItem(user.new_order_firebase_uid, orderId);
    
                            controllers.firebaseController.deleteEntry(orderId).then(removed => {
                                if (removed) {
                                    history.cancellationTime = new Date();
    
                                    history.save(saved => {
                                        user.save(saving => {
                                            res.status(200).json({ status: true, message: 'User has successfully gotten refund' })
                                        })
                                    });
                                } else {
                                    res.status(500).json({ status: false, message: 'Firebase failed to remove entry' });
                                }
                            }).catch(err => res.status(500).json({ status: false, message: err.message }));
                        } else {
                            return res.status(409).json({ status: false, message: 'An error occured from paystack while trying to refund customer' });
                        }
                    }
                }
            }).catch(err => res.status(500).json({ status: false, message: err.message }));
        }
    }).catch(err => res.status(500).json({ status: false, message: err.message }));
}

userController.deleteCard = (req, res) => {
    const cardId = req.params.id;
    db.User.findById(req.user).then(user => {
        if (!user) {
            res.status(404).json({ status: false, message: 'This user was not found' });
        } else {
            db.Card.findById(cardId).populate('user').then(card => {
                if (!card) {
                    res.status(404).json({ status: false, message: 'This card was not found' });
                } else {
                    if (card.user._id === req.user) {
                        const idx = user.cards.indexOf(cardId);
                        if (idx !== -1) user.cards.splice(idx, 1);

                        user.save().then(saved => {
                            db.Card.findByIdAndDelete(cardId, (err, deleted) => {
                                if (err) {
                                    res.status(500).json({ status: false, message: err.message });
                                } else {
                                    res.status(200).json({ status: true, message: 'Successfully deleted the card', data: deleted });
                                }
                            });
                        }).catch(err => res.status(500).json({ status: false, message: `An error occured while deleting user card ${error.message}` }));
                    } else {
                        res.status(401).json({ status: false, message: 'Delete failed, this card does not belong to this user!' });
                    }
                }
            })
        }
    }).catch(err => {
        res.status(500).json({ status: false, message: err.message });
    });
}

export default userController;