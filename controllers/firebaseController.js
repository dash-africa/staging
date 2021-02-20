import firebase from 'firebase';
import uniqid from 'uniqid';

var config = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: "dash-9893e.firebaseapp.com",
    databaseURL: "https://dash-9893e.firebaseio.com",
    projectId: "dash-9893e",
    storageBucket: "dash-9893e.appspot.com",
};
firebase.initializeApp(config);

const firebaseController = {};

firebaseController.createNewOrder = (obj) => {
    return new Promise((resolve, reject) => {
        const firebase_id = uniqid();
        let ref = firebase.database().ref("/orders/" + firebase_id);
        ref.once('value').then(function (snap) {
            ref.set(obj, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(firebase_id);
                }
            });
        });
    });
};

firebaseController.changeStatus = (firebase_uid, driverId, status) => {
    return new Promise((resolve, reject) => {
        let ref = firebase.database().ref("/orders/" + firebase_uid);
        ref.once('value').then(function (snap) {
            ref.update({
                status,
                ...(driverId && { assignedDriver: driverId })
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(snap.val());
                }
            });
        });
    });
};

firebaseController.deleteEntry = (firebase_uid) => {
    return new Promise((resolve, reject) => {
        let ref = firebase.database().ref("/orders/" + firebase_uid);
        ref.remove().then(() => {
            resolve(true);
        }).catch(() => {
            reject(false);
        });
    });
};



export default firebaseController;