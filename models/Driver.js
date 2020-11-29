import mongoose from 'mongoose';
const { Schema } = mongoose;

const driverSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    lastname: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    address: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    email: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    phone: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    password: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    drivers_license: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    id_card: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    account_number: {
        type: Number,
        required: true,
        help: 'This field is required'
    },
    photo: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    session_token: {
        type: String,
        default: ''
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_email_verified: {
        type: Boolean,
        default: false
    },
    is_phone_verified: {
        type: Boolean,
        default: false
    },
    successful_deliveries: {
        type: Number,
        default: 0
    },
    failed_deliveries: {
        type: Number,
        default: 0
    },
    average_rating: {
        type: Number,
        default: 0
    },
    overall_earnings: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;