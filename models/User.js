import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
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
    email: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    password: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    phone: {
        type: String,
        required: true,
        help: "This field is required"
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_phone_verified: {
        type: Boolean,
        default: false
    },
    session_token: {
        type: String,
        default: ''
    },
    cards: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    carts: [{
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    }],
    history: [{
        type: Schema.Types.ObjectId,
        ref: 'History'
    }],
    new_order_firebase_uid: [{
        type: String,
        default: ''
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;