import path from 'path';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import jwt from 'jsonwebtoken';

import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET_KEY,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
            reject("Failed to create access token :(");
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL_USERNAME,
            accessToken,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET_KEY,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN
        }
    });

    return transporter;
};


const sendMail = (dir_path, object) => {
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

const signUser = (user) => {
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

// const transporter = nodemailer.createTransport({
//     service: 'SendGrid',
//     auth: {
//         user: process.env.SENDGRID_USER,
//         pass: process.env.SENDGRID_PASS
//     }
// });

export { sendMail, signUser, createTransporter };