import firebase from 'firebase';
import uniqid from 'uniqid';

const firebase_id = uniqid();

var config = {
    apiKey: "AIzaSyCLCcDMey2l91ZTwuT3avheF5R85-klUcM",
    authDomain: "dash-9893e.firebaseapp.com",
    databaseURL: "https://dash-9893e.firebaseio.com",
    projectId: "dash-9893e",
    storageBucket: "dash-9893e.appspot.com",
};
firebase.initializeApp(config);

const firebaseController = {};

firebaseController.createNewOrder = (store, delivery_fee, amount, history_id, status, user) => {
    return new Promise((resolve, reject) => {
        let ref = firebase.database().ref("/newOrder/" + firebase_id);
        ref.once('value').then(function (snap) {
            ref.set({
                user,
                store,
                history_id,
                delivery_fee,
                amount,
                status
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(firebase_id);
                }
            });
        });
    });
};

export default firebaseController;